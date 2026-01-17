import "dotenv/config"

import next from "next"
import { createServer } from "http"
import { initSocket } from "./lib/socket-server"

const app = next({ dev: process.env.NODE_ENV !== "production" })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  initSocket(server)

  server.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000")
  })
})
