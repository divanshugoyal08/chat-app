"use client"

import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 space-y-4 border p-6 rounded">
        <h1 className="text-xl font-bold text-center">
          Forgot Password
        </h1>

        {sent ? (
          <p className="text-sm text-center">
            If an account exists with this email,  
            you’ll receive a reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border p-2"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              disabled={loading}
              className="w-full bg-black text-white p-2"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          <a href="/login" className="underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  )
}
