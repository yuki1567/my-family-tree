import type { AppType } from '@backend/server.js'
import { hc } from 'hono/client'

export const useRpcClient = () => {
  return hc<AppType>('')
}
