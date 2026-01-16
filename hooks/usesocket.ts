"use client"

import { useEffect } from "react"
import { getSocket, disconnectSocket } from "@/lib/socket-client"

export const useSocket = () => {
  useEffect(() => {
    const socket = getSocket()

    return () => {
      disconnectSocket()
    }
  }, [])
}
