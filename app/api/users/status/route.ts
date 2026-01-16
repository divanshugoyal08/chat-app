import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json([])

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const statuses = await prisma.userStatus.findMany({
      select: {
        userId: true,
        isOnline: true,
      },
    })

    return NextResponse.json(statuses)
  } catch {
    return NextResponse.json([])
  }
}
