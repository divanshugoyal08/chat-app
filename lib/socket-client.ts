import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    fetch("/api/socket") // 👈 init server

    socket = io({
      path: "/api/socket",
    })
  }

  return socket
}


export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}
