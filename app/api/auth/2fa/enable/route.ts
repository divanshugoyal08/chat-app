import { NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import  prisma  from "@/lib/prisma"
import QRCode from "qrcode"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as any

  const secret = speakeasy.generateSecret({
    name: "ChatApp",
  })

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  await prisma.user.update({
    where: { id: payload.userId },
    data: {
      twoFASecret: secret.base32,
      is2FAEnabled: false,
    },
  })

  return NextResponse.json({
    qrCode,
    manualKey: secret.base32,
  })
}
