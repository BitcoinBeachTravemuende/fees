import { createActor } from 'xstate'
import * as KeyValueStore from '@effect/platform-browser/KeyValueStore'

import { machine } from './machine'
import * as Effect from 'effect/Effect'
import { Schema as S } from '@effect/schema'
import { pipe, Option as O } from 'effect'
import { EndpointMapSchema, type EndpointMap } from '../types'
import * as Mempool from '../api/mempool'
import * as Esplora from '../api/esplora'

export const INTERVAL_MS = 100
export const MAX_TICK_MS = 30000

const getLocalStorage = <R, I, A>(key: string, schema: S.Schema<R, I, A>) =>
  pipe(
    KeyValueStore.KeyValueStore,
    Effect.flatMap((kv) => kv.get(key)),
    // In case there is no value, set empty string to break decoding in next step
    Effect.map(O.getOrElse(() => '')),
    Effect.flatMap(S.decodeUnknown(S.parseJson(schema)))
  )

export const getEndpoints = () =>
  getLocalStorage('endpoints', EndpointMapSchema)

const setLocalStorage = <R, I, A>(
  value: A,
  key: string,
  schema: S.Schema<R, I, A>
) =>
  pipe(
    value,
    S.encode(schema),
    Effect.flatMap((json) =>
      pipe(
        KeyValueStore.KeyValueStore,
        Effect.flatMap((kv) => kv.set(key, JSON.stringify(json)))
      )
    )
  )

export const setEndpoints = (endpoints: EndpointMap) =>
  setLocalStorage(endpoints, 'endpoints', EndpointMapSchema)

export const defaultEndpoints: Effect.Effect<
  KeyValueStore.KeyValueStore,
  Error,
  EndpointMap
> = pipe(
  getEndpoints(),
  Effect.orElse(() =>
    Effect.all({
      mempool: Mempool.defaultUrl(),
      esplora: Esplora.defaultUrl(),
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
