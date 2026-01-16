"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { getSocket } from "@/lib/socket-client"

type Message = {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
}

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chatId) return

    fetch(`/api/chat/${chatId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))

    const socket = getSocket()

    socket.emit("chat:join", chatId)
    socket.emit("chat:open", chatId)

    socket.on("message:new", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      socket.emit("chat:close", chatId)
      socket.emit("chat:leave", chatId)
      socket.off("message:new")
    }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!text.trim()) return
    getSocket().emit("message:send", { chatId, content: text })
    setText("")
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>Chat</h2>

      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((m) => {
          const isMine = m.senderId === "me"

          return (
            <div
              key={m.id}
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                background: isMine ? "#dcf8c6" : "#f1f1f1",
                padding: "8px 12px",
                borderRadius: 12,
                maxWidth: "70%",
                fontSize: 14,
              }}
            >
              {m.content}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          style={{ flex: 1, padding: 8 }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}
