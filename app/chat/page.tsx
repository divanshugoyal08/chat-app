"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { socket } from "@/lib/socket-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type ChatItem = {
  chatId: string
  user: {
    id: string
    name?: string
    image?: string
  }
  lastMessage?: {
    content: string
    createdAt: string
  } | null
}

type Message = {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
  read?: boolean
}

export default function ChatDashboard() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [meId, setMeId] = useState<string | null>(null)

  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [activeUserId, setActiveUserId] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  /* =========================
     AUTH CHECK
  ========================== */
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        setMeId(data.id)
        setAuthorized(true)
      })
      .finally(() => setLoading(false))
  }, [])

  /* =========================
     LOAD CHAT LIST
  ========================== */
  useEffect(() => {
    if (!authorized) return
    fetch("/api/chat/list")
      .then(res => res.json())
      .then(setChats)
  }, [authorized])

  /* =========================
     LOAD UNREAD COUNT
  ========================== */
  useEffect(() => {
    if (!authorized) return
    fetch("/api/notifications/unread-count")
      .then(res => res.json())
      .then(d => setUnreadCount(d.count))
  }, [authorized])

  /* =========================
     SOCKET CONNECT
  ========================== */
  useEffect(() => {
    if (!authorized || !meId) return
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [authorized, meId])

  /* =========================
     SOCKET LISTENERS
  ========================== */
  useEffect(() => {
    socket.on("message:new", (msg: Message) => {
      if (msg.chatId === activeChatId) {
        setMessages(prev => [...prev, msg])
        socket.emit("message:seen", {
          chatId: msg.chatId,
          receiverId: activeUserId,
        })
        scrollBottom()
      } else {
        setUnreadCount(c => c + 1)
      }
    })

    socket.on("notification:new", () => {
      setUnreadCount(c => c + 1)
    })

    socket.on("typing", ({ chatId }) => {
      if (chatId === activeChatId) setIsTyping(true)
    })

    socket.on("typing:stop", ({ chatId }) => {
      if (chatId === activeChatId) setIsTyping(false)
    })

    socket.on("message:seen", ({ chatId }) => {
      if (chatId === activeChatId) {
        setMessages(prev =>
          prev.map(m =>
            m.senderId === meId ? { ...m, read: true } : m
          )
        )
      }
    })

    return () => {
      socket.off("message:new")
      socket.off("notification:new")
      socket.off("typing")
      socket.off("typing:stop")
      socket.off("message:seen")
    }
  }, [activeChatId, activeUserId, meId])

  /* =========================
     OPEN CHAT
  ========================== */
  function openChat(chat: ChatItem) {
    setActiveChatId(chat.chatId)
    setActiveUserId(chat.user.id)

    fetch(`/api/chat/${chat.chatId}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data)
        setTimeout(scrollBottom, 50)
      })

    fetch(`/api/chat/${chat.chatId}/read`, { method: "POST" })
    setUnreadCount(0)

    socket.emit("message:seen", {
      chatId: chat.chatId,
      receiverId: chat.user.id,
    })
  }

  /* =========================
     OPTIMISTIC MESSAGE (FIX)
  ========================== */
  function addLocalMessage(content: string) {
    if (!activeChatId || !meId) return

    const localMessage: Message = {
      id: crypto.randomUUID(),
      chatId: activeChatId,
      senderId: meId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    }

    setMessages(prev => [...prev, localMessage])
    scrollBottom()
  }

  function scrollBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  /* =========================
     UI STATES
  ========================== */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading dashboard…
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">You are not logged in</p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    )
  }

  /* =========================
     MAIN UI
  ========================== */
  return (
    <div className="h-screen grid grid-cols-[280px_1fr] bg-background">
      {/* SIDEBAR */}
      <aside className="border-r flex flex-col">
        <div className="p-4 font-semibold text-lg flex justify-between">
          Chats
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map(chat => (
            <Card
              key={chat.chatId}
              onClick={() => openChat(chat)}
              className={`cursor-pointer ${
                activeChatId === chat.chatId ? "bg-muted" : ""
              }`}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar>
                  <AvatarFallback>
                    {chat.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {chat.user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage?.content || "No messages"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="p-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" })
              window.location.href = "/login"
            }}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="flex flex-col">
        <div className="h-16 border-b flex items-center px-6 font-medium">
          {activeChatId ? "Chat" : "Select a chat"}
          {isTyping && (
            <span className="ml-2 text-xs text-muted-foreground">
              typing…
            </span>
          )}
        </div>

        <div className="flex-1 p-6 space-y-3 overflow-y-auto">
          {messages.map(m => (
            <div
              key={m.id}
              className={`max-w-xs p-3 rounded-lg text-sm ${
                m.senderId === meId
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {m.content}
              {m.senderId === meId && (
                <span className="ml-2 text-xs opacity-60">
                  {m.read ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {activeChatId && (
          <form
            className="border-t p-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!text || !activeUserId || !activeChatId) return

              // ✅ FIX: instant sender UI
              addLocalMessage(text)

              socket.emit("message:send", {
                chatId: activeChatId,
                receiverId: activeUserId,
                content: text,
              })

              socket.emit("typing:stop", {
                chatId: activeChatId,
                receiverId: activeUserId,
              })

              setText("")
            }}
          >
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                socket.emit("typing:start", {
                  chatId: activeChatId,
                  receiverId: activeUserId,
                })
              }}
              placeholder="Type a message…"
            />
            <button className="px-4">Send</button>
          </form>
        )}
      </main>
    </div>
  )
}
