"use client"

import { useState } from "react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password || !confirmPassword) {
      alert("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.message || "Registration failed")
      return
    }

    alert("Registration successful. Please login.")
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="w-96 space-y-4 border p-6 rounded"
      >
        <h1 className="text-2xl font-bold text-center">Register</h1>

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

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Login
          </a>
        </p>
      </form>
    </div>
  )
}
