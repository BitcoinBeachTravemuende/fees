import { useSelector } from '@xstate/svelte'

import { createActor } from 'xstate'

import { machine } from './machine'

const actorRef = createActor(machine).start()

export const send = actorRef.send
export const state = useSelector(actorRef, (s) => s.value)
export const fees = useSelector(actorRef, (s) => s.context.fees)
export const endpoint = useSelector(actorRef, (s) => s.context.endpoint)
export const retries = useSelector(actorRef, (s) => s.context.retries)
