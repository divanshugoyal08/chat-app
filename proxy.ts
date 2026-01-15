import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-2fa",
  "/",
]

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // ✅ Allow auth APIs
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value

  // 🔒 Protect private pages
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/settings/:path*",
    "/dashboard/:path*",
  ],
}
