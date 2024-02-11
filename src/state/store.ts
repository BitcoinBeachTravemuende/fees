import { createActor } from 'xstate'
import { BrowserKeyValueStore } from '@effect/platform-browser'
import { KeyValueStore } from '@effect/platform'

import { machine } from './machine'
import { machine as themeMachine } from './themeMachine'
import * as Effect from 'effect/Effect'
import { pipe } from 'effect'
import { type EndpointMap } from '../types'
import * as Mempool from '../api/mempool'
import * as Esplora from '../api/esplora'
import * as Bitgo from '../api/bitgo'
import * as Blockcypher from '../api/blockcypher'
import * as Blockchain from '../api/blockchain'
import * as Rpc from '../api/rpc-explorer'
import * as Storage from '../util/storage'

export const INTERVAL_MS = 100
export const MAX_TICK_MS = 30000

export const defaultEndpoints: Effect.Effect<
  EndpointMap,
  Error,
  KeyValueStore.KeyValueStore
> = pipe(
  Storage.getEndpoints(),
  Effect.orElse(() =>
    Effect.all({
      mempool: Mempool.defaultUrl(),
      esplora: Esplora.defaultUrl(),
      'rpc-explorer': Rpc.defaultUrl(),
      bitgo: Bitgo.defaultUrl(),
      blockcypher: Blockcypher.defaultUrl(),
      blockchain: Blockchain.defaultUrl(),
    })
  )
)

export const actorRef = createActor(machine, {
  input: {
    endpoints: Effect.runSync(
      Effect.provide(defaultEndpoints, BrowserKeyValueStore.layerLocalStorage)
    ),
    selectedEndpoint: 'mempool',
  },
}).start()

export const themeActorRef = createActor(themeMachine).start()
