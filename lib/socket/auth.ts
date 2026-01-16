import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export function verifySocketToken(token?: string) {
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}
