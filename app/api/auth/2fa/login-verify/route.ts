import { NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import jwt from "jsonwebtoken"
import  prisma  from "@/lib/prisma"
import { signToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const tempToken = req.cookies.get("token")?.value

  if (!tempToken) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 })
  }

  const payload = jwt.verify(tempToken, process.env.JWT_SECRET!) as any

  if (!payload.twoFA) {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || !user.twoFASecret) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token: code,
    window: 1,
  })

  if (!verified) {
    return NextResponse.json({ message: "Invalid 2FA code" }, { status: 400 })
  }

  const finalToken = signToken({ userId: user.id })

  const cookieStore = await cookies()
  cookieStore.set("token", finalToken, {
    httpOnly: true,
    path: "/",
  })

  cookieStore.delete("temp_token")

  return NextResponse.json({ message: "Login successful" })
}
