import { createApp } from '@/app.js'
import { envConfig } from '@/config/env.js'

export function startServer(): void {
  const app = createApp()
  const port = envConfig.API_PORT

  app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`)
  })
}

startServer()
