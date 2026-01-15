import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { is2FAEnabled: true },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
