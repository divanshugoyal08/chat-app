import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json()

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  })

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  })

  return NextResponse.json({ message: "Password reset successful" })
}
