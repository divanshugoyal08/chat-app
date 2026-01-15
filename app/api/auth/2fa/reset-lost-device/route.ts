import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as any

  await prisma.user.update({
    where: { id: payload.userId },
    data: {
      is2FAEnabled: false,
      twoFASecret: null,
    },
  })

  return NextResponse.json({
    message: "2FA reset. Please enable again.",
  })
}
