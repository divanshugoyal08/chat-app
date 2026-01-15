"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

// shadcn
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ChatDashboard() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

 useEffect(() => {
  fetch("/api/auth/me", {
    credentials: "include", // 🔥 IMPORTANT
  })
    .then((res) => setAuthorized(res.ok))
    .finally(() => setLoading(false))
}, [])


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
        <p className="text-muted-foreground">
          You are not logged in
        </p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="h-screen grid grid-cols-[280px_1fr] bg-background">

      {/* SIDEBAR */}
      <aside className="border-r flex flex-col">
        <div className="p-4 font-semibold text-lg">
          Chat Dashboard
        </div>

        <Separator />

        {/* CHAT LIST */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {["Partner 1", "Partner 2"].map((name) => (
            <Card
              key={name}
              className="cursor-pointer hover:bg-muted transition"
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar>
                  <AvatarFallback>
                    {name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {name}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* FOOTER ACTIONS */}
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

      {/* MAIN CHAT */}
      <main className="flex flex-col">

        {/* HEADER */}
        <div className="h-16 border-b flex items-center px-6 font-medium">
          Partner Chat
        </div>

        {/* MESSAGES */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="max-w-xs rounded-lg bg-muted p-3 text-sm">
            👋 Welcome! Your chat system is ready.
          </div>

          <div className="max-w-xs ml-auto rounded-lg bg-primary text-primary-foreground p-3 text-sm">
            Looks clean & professional 👍
          </div>
        </div>

        {/* INPUT */}
        <div className="border-t p-4 flex gap-2">
          <input
            disabled
            placeholder="Type a message…"
            className="flex-1 h-10 rounded-md border px-3 text-sm"
          />
          <Button disabled>Send</Button>
        </div>
      </main>
    </div>
  )
}
