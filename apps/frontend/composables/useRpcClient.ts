import type { AppType } from '@backend/app.js'
import { hc } from 'hono/client'

export const useRpcClient = () => {
  return hc<AppType>('')
}
