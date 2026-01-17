import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId } = verifyToken(token) as { userId: string }
    const { otherUserId } = await req.json()

    // 🔍 Check existing chat between same users
    const existingChat = await prisma.chat.findFirst({
      where: {
        users: {
          every: {
            id: { in: [userId, otherUserId] },
          },
        },
      },
      select: { id: true },
    })

    if (existingChat) {
      return NextResponse.json({ chatId: existingChat.id })
    }

    // ➕ Create new chat
    const chat = await prisma.chat.create({
      data: {
        users: {
          connect: [{ id: userId }, { id: otherUserId }],
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ chatId: chat.id })
  } catch (e) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
