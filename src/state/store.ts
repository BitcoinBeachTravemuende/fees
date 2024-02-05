import { createActor } from 'xstate'

import { machine } from './machine'

export const INTERVAL_MS = 100
export const MAX_TICK_MS = 30000

export const actorRef = createActor(machine, {
  input: {
    url: new URL('https://mempool.space/api/v1/fees/recommended'),
    endpoint: 'mempool',
  },
}).start()
