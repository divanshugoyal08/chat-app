import { NextRequest, NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import prisma from "@/lib/prisma"
import { signToken } from "@/lib/jwt"
import { cookies } from "next/headers"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json(
        { message: "ID token required" },
        { status: 400 }
      )
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload?.email) {
      return NextResponse.json(
        { message: "Invalid Google token" },
        { status: 401 }
      )
    }

    const email = payload.email
    const name = payload.name
    const image = payload.picture

    let user = await prisma.user.findUnique({
      where: { email },
    })
    if (user && user.provider === "PASSWORD") {
      return NextResponse.json(
        {
          message:
            "This email is registered with password login. Use email & password.",
        },
        { status: 409 }
      )
    }

   
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          provider: "GOOGLE",
        },
      })
    }

    const cookieStore = await cookies()

    if (user.is2FAEnabled) {
      const tempToken = signToken(
        { userId: user.id, twoFA: true },
        "5m"
      )

      cookieStore.set("temp_token", tempToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })

      return NextResponse.json({
        require2FA: true,
      })
    }
    
    const token = signToken({
      userId: user.id,
      twoFA: false,
    })
    

    cookieStore.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Google login failed" },
      { status: 500 }
    )
  }
}
