import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import  prisma  from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      )
    }

    // check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        provider: "PASSWORD",
        name,
      },
    })

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
