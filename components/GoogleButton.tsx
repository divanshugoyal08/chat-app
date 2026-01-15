"use client"


import { useEffect, useRef } from "react"

declare global {
  interface Window {
    google: any
  }
}

export default function GoogleButton() {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.google || !divRef.current) return

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: any) => {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        })

        const data = await res.json()

        if (data.require2FA) {
          window.location.href = "/verify-2fa"
          return
        }

        if (res.ok) {
          window.location.href = "/chat"
        } else {
          alert(data.message)
        }
      },
    })

    window.google.accounts.id.renderButton(divRef.current, {
      theme: "outline",
      size: "large",
      width: 360,
    })
  }, [])

  return <div ref={divRef}></div>
}
