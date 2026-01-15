"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type TwoFAStatus = {
  is2FAEnabled: boolean
}

export default function SecurityPage() {
  const [status, setStatus] = useState<TwoFAStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")

  // 🔹 get current status
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setStatus(data))
  }, [])

  // 🔹 enable 2FA (step 1)
  async function enable2FA() {
    setLoading(true)
    const res = await fetch("/api/auth/2fa/enable", { method: "POST" })
    const data = await res.json()
    setLoading(false)

    setQr(data.qrCode)
  }

  // 🔹 confirm enable (step 2)
  async function verifyEnable() {
    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    if (res.ok) {
      alert("2FA enabled successfully")
      window.location.reload()
    } else {
      alert("Invalid code")
    }
  }

  // 🔹 disable 2FA
  async function disable2FA() {
    const res = await fetch("/api/auth/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, code }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    alert("2FA disabled")
    window.location.reload()
  }

  if (!status) {
    return <div className="p-10">Loading…</div>
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Security Settings</h1>

      <div className="border p-4 rounded">
        <p className="font-medium">
          Two-Factor Authentication:
          <span className="ml-2">
            {status.is2FAEnabled ? "Enabled ✅" : "Disabled ❌"}
          </span>
        </p>
      </div>

      {/* ENABLE FLOW */}
      {!status.is2FAEnabled && (
        <div className="space-y-4">
          {!qr ? (
            <button
              onClick={enable2FA}
              disabled={loading}
              className="bg-black text-white px-4 py-2"
            >
              Enable 2FA
            </button>
            
          ) : (
            <div className="space-y-4">
              <img src={qr} alt="QR Code" />
              <input
                placeholder="Enter 6-digit code"
                className="border p-2 w-full"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                onClick={verifyEnable}
                className="bg-black text-white px-4 py-2"
              >
                Verify & Enable
              </button>
            </div>
          )}
             <Link
  href="/chat"
  className="inline-block px-4 py-2 border rounded hover:bg-gray-100"
>
  ← Back to Dashboard
</Link>

        </div>
      )}

      {/* DISABLE FLOW */}
      {status.is2FAEnabled && (
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            placeholder="2FA Code"
            className="border p-2 w-full"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            onClick={disable2FA}
            className="bg-red-600 text-white px-4 py-2"
          >
            Disable 2FA
          </button>
          <Link
  href="/chat"
  className="inline-block px-4 py-2 border rounded hover:bg-gray-100"
>
  ← Back to Dashboard
</Link>

        </div>
      )}
      <button
  onClick={async () => {
    const confirmReset = confirm(
      "Authenticator app lost? This will disable 2FA and log you out."
    )
    if (!confirmReset) return

    const res = await fetch("/api/auth/2fa/reset-lost-device", {
      method: "POST",
    })

    if (res.ok) {
      alert("2FA has been reset. Please login again.")
      window.location.href = "/login"
    } else {
      alert("Something went wrong. Try again.")
    }
  }}
  className="mt-2 text-sm text-red-600 underline"
>
  I lost my authenticator device
</button>

    </div>
  )
}
