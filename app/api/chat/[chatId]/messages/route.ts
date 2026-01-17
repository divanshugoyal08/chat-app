import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await context.params // ✅ FIX HERE

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId } = verifyToken(token) as { userId: string }

    // 🔒 Ensure user is part of the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: { id: userId },
        },
      },
      select: { id: true },
    })

    if (!chat) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // 📩 Fetch messages
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        senderId: true,
        content: true,
        read: true,
        createdAt: true,
      },
    })

    return NextResponse.json(messages)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
