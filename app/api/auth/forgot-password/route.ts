import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendResetPasswordEmail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })

  // 🔐 Always return success (security)
  if (!user) {
    return NextResponse.json({ success: true })
  }

  // 1️⃣ Generate token
  const rawToken = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex")

  // 2️⃣ Save token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
  })

  // 3️⃣ Create reset link
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`

  // 4️⃣ Send email
  await sendResetPasswordEmail(user.email, resetLink)

  return NextResponse.json({ success: true })
}
