import { NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import  prisma  from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const token = req.cookies.get("token")?.value

  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })

  if (!user || !user.twoFASecret) {
    return NextResponse.json({ message: "2FA not setup" }, { status: 400 })
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token: code,
    window: 1,
  })

  if (!verified) {
    return NextResponse.json({ message: "Invalid code" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: payload.userId },
    data: {
      is2FAEnabled: true,
    },
  })

  return NextResponse.json({ message: "2FA enabled" })
}
