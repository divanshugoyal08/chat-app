import { Server as IOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import { verifySocketToken } from "./auth"
import prisma from "@/lib/prisma"

let io: IOServer | null = null

export function initSocket(server: HTTPServer) {
  if (io) return io

  io = new IOServer(server, {
    path: "/socket",
    cors: {
      origin: true,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.cookie?.split("token=")[1]

    const payload = verifySocketToken(token)
    if (!payload) return next(new Error("Unauthorized"))

    socket.data.userId = payload.userId
    next()
  })

  io.on("connection", async (socket) => {
    const userId: string = socket.data.userId

    await prisma.userStatus.upsert({
      where: { userId },
      update: { isOnline: true, lastSeen: new Date() },
      create: { userId, isOnline: true },
    })

    socket.on("chat:join", (chatId: string) => {
      socket.join(`chat:${chatId}`)
    })

    socket.on("chat:leave", (chatId: string) => {
      socket.leave(`chat:${chatId}`)
    })

    socket.on("chat:open", async (chatId: string) => {
      const unreadMessages = await prisma.message.findMany({
        where: {
          chatId,
          senderId: { not: userId },
          reads: {
            none: { userId },
          },
        },
        select: { id: true },
      })

      if (unreadMessages.length > 0) {
        await prisma.messageRead.createMany({
          data: unreadMessages.map((m) => ({
            messageId: m.id,
            userId,
          })),
          skipDuplicates: true,
        })
        io?.to(`chat:${chatId}`).emit("message:read", {
  chatId,
  readerId: userId,
})

      }

      await prisma.notification.updateMany({
        where: {
          userId,
          message: {
            chatId,
          },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    })

    socket.on("chat:close", (chatId: string) => {})

    socket.on(
      "message:send",
      async (payload: { chatId: string; content: string }) => {
        const { chatId, content } = payload

        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: userId,
            content,
          },
        })

        io?.to(`chat:${chatId}`).emit("message:new", {
          id: message.id,
          chatId,
          senderId: userId,
          content,
          createdAt: message.createdAt,
        })

        const members = await prisma.chatUser.findMany({
          where: {
            chatId,
            userId: { not: userId },
          },
          select: { userId: true },
        })

        for (const member of members) {
          const room = io?.sockets.adapter.rooms.get(`chat:${chatId}`)
          const isUserInRoom = room
            ? [...room].some((socketId) => {
                const s = io?.sockets.sockets.get(socketId)
                return s?.data.userId === member.userId
              })
            : false

          if (!isUserInRoom) {
            await prisma.notification.create({
              data: {
                userId: member.userId,
                messageId: message.id,
                type: "MESSAGE",
              },
            })
          }
        }
      }
    )

    socket.on("notification:read", async (notificationId: string) => {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
        },
      })
    })

    socket.on("disconnect", async () => {
      await prisma.userStatus.update({
        where: { userId },
        data: { isOnline: false, lastSeen: new Date() },
      })
    })
  })

  return io
}
