import { NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  const { password, code } = await req.json()
  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  let payload: any
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!)
  } catch {
    return NextResponse.json(
      { message: "Invalid session" },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || !user.is2FAEnabled || !user.twoFASecret) {
    return NextResponse.json(
      { message: "2FA not enabled" },
      { status: 400 }
    )
  }

  const codeOk = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: "base32",
    token: code,
    window: 2,
  })

  if (!codeOk) {
    return NextResponse.json(
      { message: "Invalid 2FA code" },
      { status: 400 }
    )
  }

  if (user.provider === "PASSWORD") {
    if (!password) {
      return NextResponse.json(
        { message: "Password required" },
        { status: 400 }
      )
    }

    const passOk = await bcrypt.compare(
      password,
      user.password!
    )

    if (!passOk) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      )
    }
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      is2FAEnabled: false,
      twoFASecret: null,
    },
  })

  return NextResponse.json({ message: "2FA disabled" })
}
