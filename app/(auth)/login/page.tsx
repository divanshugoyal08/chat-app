"use client"

import { useState } from "react"
import GoogleButton from "@/components/GoogleButton"
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.require2FA) {
      window.location.href = "/verify-2fa"
      return
    }

    if (res.ok) {
      window.location.href = "/chat"
    } else {
      alert(data.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="w-96 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="w-full border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white p-2"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center text-sm">OR</div>

        
        <GoogleButton />
      </form>
    </div>
  )
}