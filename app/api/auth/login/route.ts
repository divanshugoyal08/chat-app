import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { signToken } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.provider !== "PASSWORD") {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password!)
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()

    // 🔐 CASE 1: 2FA ENABLED
    if (user.is2FAEnabled) {
      const tempToken = signToken(
        {
          userId: user.id,
          twoFA: true,
        },
        "5m"
      )

      cookieStore.set("temp_token", tempToken, {
       
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production", // 🔥 important
  path: "/",
})


      return NextResponse.json({
        message: "2FA required",
        require2FA: true,
      })
    }

    // 🔓 CASE 2: 2FA NOT ENABLED
    const token = signToken({ userId: user.id })

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return NextResponse.json({
      message: "Login successful",
      userId: user.id,
      is2FAEnabled: false,
    })
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
