import { NextResponse } from "next/server"
import { Server } from "socket.io"

export const dynamic = "force-dynamic"

let io: Server | null = null

export async function GET() {
  if (!io) {
    io = new Server({
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    })

    io.on("connection", (socket) => {
      socket.on("message:send", (msg) => {
        io?.emit("message:new", msg)
      })
    })
  }

  return NextResponse.json({ ok: true })
}
