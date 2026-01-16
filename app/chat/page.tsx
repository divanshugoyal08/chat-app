"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { getSocket } from "@/lib/socket-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Chat = {
  id: string
}

type Message = {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
  read?: boolean
}


type UserStatus = {
  userId: string
  isOnline: boolean
}

export default function ChatDashboard() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [meId, setMeId] = useState<string | null>(null)

  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")

  const [unreadCount, setUnreadCount] = useState(0)
  const [userStatusMap, setUserStatusMap] = useState<Record<string, boolean>>({})

  const bottomRef = useRef<HTMLDivElement | null>(null)

  /* AUTH */
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

  /* CHAT LIST + UNREAD + STATUS */
  useEffect(() => {
    if (!authorized) return

    fetch("/api/chat/list")
      .then((r) => r.json())
      .then((data) => setChats(data))

    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count))

    fetch("/api/users/status")
      .then((r) => r.json())
      .then((data: UserStatus[]) => {
        const map: Record<string, boolean> = {}
        data.forEach((u) => {
          map[u.userId] = u.isOnline
        })
        setUserStatusMap(map)
      })
  }, [authorized])

  /* ACTIVE CHAT */
  useEffect(() => {
    if (!activeChat) return

    fetch(`/api/chat/${activeChat}/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data))

    const socket = getSocket()

    socket.emit("chat:join", activeChat)
    socket.emit("chat:open", activeChat)
    setUnreadCount(0)

   socket.on("message:new", (message: Message) => {
  if (message.chatId === activeChat) {
    setMessages((prev) => [...prev, message])
  } else {
    setUnreadCount((c) => c + 1)
  }
})

socket.on("message:read", ({ readerId }) => {
  setMessages((prev) =>
    prev.map((m) =>
      m.senderId === meId ? { ...m, read: true } : m
    )
  )
})

    return () => {
      socket.emit("chat:close", activeChat)
      socket.emit("chat:leave", activeChat)
      socket.off("message:new")
  socket.off("message:read")
    }
  }, [activeChat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!text.trim() || !activeChat) return
    getSocket().emit("message:send", {
      chatId: activeChat,
      content: text,
    })
    setText("")
  }

  const isOnline = (userId: string) => userStatusMap[userId]

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

  return (
    <div className="h-screen grid grid-cols-[280px_1fr] bg-background">
      <aside className="border-r flex flex-col">
        <div className="p-4 font-semibold text-lg flex justify-between items-center">
          Chats
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`cursor-pointer ${
                activeChat === chat.id ? "bg-muted" : ""
              }`}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar>
                  <AvatarFallback className="relative">
                    {chat.id[0]}
                    <span
                      className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
                        isOnline(chat.id)
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  Chat {chat.id.slice(0, 6)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="p-4 space-y-2 text-sm">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/settings/security">⚙ Security</Link>
          </Button>

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

      <main className="flex flex-col">
        <div className="h-16 border-b flex items-center px-6 font-medium gap-2">
          {activeChat ? "Chat" : "Select a chat"}
          {activeChat && (
            <span className="text-xs text-muted-foreground">
              {isOnline(activeChat) ? "Online" : "Offline"}
            </span>
          )}
        </div>

        <div className="flex-1 p-6 space-y-3 overflow-y-auto">
          {!activeChat && (
            <div className="text-muted-foreground">
              Select a chat to start messaging
            </div>
          )}

          {messages.map((m) => {
  const isMine = m.senderId === meId

  return (
    <div
      key={m.id}
      className={`max-w-xs p-3 rounded-lg text-sm ${
        isMine
          ? "ml-auto bg-primary text-primary-foreground"
          : "bg-muted"
      }`}
    >
      {m.content}
      {isMine && (
        <span className="ml-2 text-xs opacity-70">
          {m.read ? "✓✓" : "✓"}
        </span>
      )}
    </div>
  )
})}


          <div ref={bottomRef} />
        </div>

        <div className="border-t p-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 h-10 rounded-md border px-3 text-sm"
            disabled={!activeChat}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button disabled={!activeChat} onClick={sendMessage}>
            Send
          </Button>
        </div>
      </main>
    </div>
  )
}
