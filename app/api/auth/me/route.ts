import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies() // ✅ FIX HERE
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,             // 🔥 REQUIRED
        is2FAEnabled: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
