import { createActor } from 'xstate'
import * as KeyValueStore from '@effect/platform-browser/KeyValueStore'

import { machine } from './machine'
import * as Effect from 'effect/Effect'
import { pipe } from 'effect'
import { type EndpointMap } from '../types'
import * as Mempool from '../api/mempool'
import * as Esplora from '../api/esplora'
import * as Rpc from '../api/rpc-explorer'
import * as Storage from '../util/storage'

export const INTERVAL_MS = 100
export const MAX_TICK_MS = 30000

export const defaultEndpoints: Effect.Effect<
  KeyValueStore.KeyValueStore,
  Error,
  EndpointMap
> = pipe(
  Storage.getEndpoints(),
  Effect.orElse(() =>
    Effect.all({
      mempool: Mempool.defaultUrl(),
      esplora: Esplora.defaultUrl(),
      'rpc-explorer': Rpc.defaultUrl(),
    })
  )
)

export const actorRef = createActor(machine, {
  input: {
    endpoints: Effect.runSync(
      Effect.provide(defaultEndpoints, KeyValueStore.layerLocalStorage)
    ),
    selectedEndpoint: 'mempool',
  },
}).start()
