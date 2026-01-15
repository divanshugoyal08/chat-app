import jwt, { SignOptions, JwtPayload } from "jsonwebtoken"
import ms from "ms"

const JWT_SECRET = process.env.JWT_SECRET!

export function signToken(
  payload: string | object | Buffer,
  expiresIn: ms.StringValue = "7d"
) {
  const options: SignOptions = {
    expiresIn,
  }

  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
