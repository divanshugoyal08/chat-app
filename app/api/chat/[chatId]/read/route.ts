import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"

export async function POST(
  req: Request,
  ctx: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await ctx.params
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({})

  const { userId } = verifyToken(token) as { userId: string }

  await prisma.message.updateMany({
    where: {
      chatId,
      senderId: { not: userId },
    },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}
