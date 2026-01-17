import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return NextResponse.json({ count: 0 })

  const { userId } = verifyToken(token) as { userId: string }

  const count = await prisma.message.count({
    where: {
      read: false,
      senderId: { not: userId },
    },
  })

  return NextResponse.json({ count })
}
