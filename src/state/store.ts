import { createActor } from 'xstate'

import { machine } from './machine'

export const INTERVAL_MS = 100
export const MAX_TICK_MS = 30000

export const actorRef = createActor(machine).start()
