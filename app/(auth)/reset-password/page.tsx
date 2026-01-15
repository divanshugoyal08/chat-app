"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()

    if (!token) {
      alert("Invalid or missing token")
      return
    }

    if (password !== confirm) {
      alert("Passwords do not match")
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.message || "Reset failed")
      return
    }

    alert("Password reset successful. Please login.")
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleReset}
        className="w-96 space-y-4 border p-6 rounded"
      >
        <h1 className="text-xl font-bold text-center">
          Reset Password
        </h1>

        <input
          type="password"
          className="w-full border p-2"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-black text-white p-2"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  )
}
