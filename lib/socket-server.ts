import { Server as HTTPServer } from "http"
import { Server as IOServer } from "socket.io"
import jwt from "jsonwebtoken"
import prisma from "@/lib/prisma"

let io: IOServer | null = null

export function initSocket(server: HTTPServer) {
  if (io) return io

  io = new IOServer(server, {
    path: "/socket.io",
    cors: {
      origin: true,
      credentials: true,
    },
  })

  const ioServer = io

  /* ============================
     AUTH VIA HTTP-ONLY COOKIE
  ============================ */
  ioServer.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie
      if (!cookieHeader) return next(new Error("No cookies"))

      const token = cookieHeader
        .split("; ")
        .find(c => c.startsWith("token="))
        ?.split("=")[1]

      if (!token) return next(new Error("No token"))

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as { userId: string }

      socket.data.user = payload
      next()
    } catch {
      next(new Error("Unauthorized"))
    }
  })

  /* ============================
     CONNECTION
  ============================ */
  ioServer.on("connection", async (socket) => {
    const { userId } = socket.data.user as { userId: string }
    if (!userId) return

    /* 🔗 USER ROOM */
    socket.join(`user:${userId}`)
    console.log("🧩 JOINED ROOM user:" + userId)

    /* 🟢 ONLINE */
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastSeen: null,
      },
    })

    ioServer.emit("user:status", { userId, isOnline: true })
    console.log("🟢 ONLINE", userId)

    /* ============================
       MESSAGE SEND
    ============================ */
    socket.on("message:send", async ({ chatId, receiverId, content }) => {
      console.log("📨 MESSAGE SEND", { chatId, userId, receiverId })

      const message = await prisma.message.create({
        data: {
          chatId,
          senderId: userId,
          content,
          read: false,
        },
      })

      ioServer.to(`user:${receiverId}`).emit("message:new", message)

      ioServer.to(`user:${receiverId}`).emit("notification:new", {
        chatId,
        messageId: message.id,
        from: userId,
      })
    })

    /* ============================
       TYPING INDICATOR
    ============================ */
    socket.on("typing:start", ({ receiverId, chatId }) => {
      ioServer.to(`user:${receiverId}`).emit("typing", {
        chatId,
        from: userId,
      })
    })

    socket.on("typing:stop", ({ receiverId, chatId }) => {
      ioServer.to(`user:${receiverId}`).emit("typing:stop", {
        chatId,
        from: userId,
      })
    })

    /* ============================
       MESSAGE SEEN (✓✓)
    ============================ */
    socket.on("message:seen", async ({ chatId }) => {
      await prisma.message.updateMany({
        where: {
          chatId,
          senderId: { not: userId },
          read: false,
        },
        data: { read: true },
      })

      ioServer.emit("message:seen", {
        chatId,
        by: userId,
      })
    })

    /* 🔴 OFFLINE */
    socket.on("disconnect", async () => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeen: new Date(),
        },
      })

      ioServer.emit("user:status", {
        userId,
        isOnline: false,
      })

      console.log("🔴 OFFLINE", userId)
    })
  })

  return io
}
