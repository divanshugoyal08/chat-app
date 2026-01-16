import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json([], { status: 401 })

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            userId: payload.userId,
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(chats)
  } catch {
    return NextResponse.json([], { status: 401 })
  }
}
