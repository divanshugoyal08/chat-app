"use client"

import { useState } from "react"

export default function Verify2FA() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
async function handleVerify() {
  setLoading(true)

  // ✅ await fetch
  const res = await fetch("/api/auth/2fa/login-verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })

  // ✅ await json
  const data = await res.json()
  setLoading(false)

  if (res.ok) {
    window.location.href = "/chat"
  } else {
    alert(data.message)
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 w-80">
        <h1 className="text-xl font-bold">Verify 2FA</h1>

        <input
          className="w-full border p-2"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          onClick={handleVerify}
          className="w-full bg-black text-white p-2"
          disabled={loading}
        >
          Verify
        </button>
      </div>
    </div>
  )
}
