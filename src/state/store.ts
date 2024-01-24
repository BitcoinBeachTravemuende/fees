import { createActor } from 'xstate'

import { machine } from './machine'

export const actorRef = createActor(machine).start()
