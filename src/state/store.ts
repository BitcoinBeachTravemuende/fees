import { createActor } from 'xstate'

import { machine } from './machine'

export const INTERVAL_MS = 100
export const MAX_TICK_MS = 30000

export const actorRef = createActor(machine, {
  input: {
    // TODO: Get endpoints from env and / or local storage
    endpoints: {
      mempool: new URL('https://mempool.space/api/v1/fees/recommended'),
      esplora: new URL('https://blockstream.info/api/fee-estimates'),
    },
    selectedEndpoint: 'mempool',
  },
}).start()
