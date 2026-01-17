import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId } = verifyToken(token) as { userId: string }

    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // 🔥 last message only
          select: {
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 🧠 format for frontend
    const formatted = chats.map((chat) => {
      const otherUser = chat.users.find((u) => u.id !== userId)

      return {
        chatId: chat.id,
        user: otherUser,
        lastMessage: chat.messages[0] || null,
        unreadCount: 0, // next step
      }
    })

    return NextResponse.json(formatted)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
