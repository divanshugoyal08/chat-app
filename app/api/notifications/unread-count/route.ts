import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ count: 0 })

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const count = await prisma.notification.count({
      where: {
        userId: payload.userId,
        isRead: false,
      },
    })

    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
