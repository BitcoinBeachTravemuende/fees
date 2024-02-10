import * as KeyValueStore from '@effect/platform/KeyValueStore'
import { BrowserKeyValueStore } from '@effect/platform-browser'

import * as Effect from 'effect/Effect'
import { Schema as S } from '@effect/schema'
import { pipe, Option as O } from 'effect'
import {
  EndpointMapSchema,
  type EndpointMap,
  ThemeSchema,
  type Theme,
} from '../types'

const KEY_ENDPOITNS = 'endpoints'
const KEY_THEME = 'theme'

const getLocalStorage = <A, E, R>(key: string, schema: S.Schema<A, E, R>) => {
  const effect = pipe(
    KeyValueStore.KeyValueStore,
    Effect.flatMap((kv) => kv.get(key)),
    // In case there is no value, set empty string to break decoding in next step
    Effect.map(O.getOrElse(() => '')),
    Effect.flatMap(S.decodeUnknown(S.parseJson(schema)))
  )
  return Effect.provide(effect, BrowserKeyValueStore.layerLocalStorage)
}

export const getEndpoints = () =>
  getLocalStorage(KEY_ENDPOITNS, EndpointMapSchema)

export const getTheme = () => getLocalStorage(KEY_THEME, ThemeSchema)

const setLocalStorage = <A, E, R>(
  value: A,
  key: string,
  schema: S.Schema<A, E, R>
) => {
  const effect = pipe(
    value,
    S.encode(schema),
    Effect.flatMap((json) =>
      pipe(
        KeyValueStore.KeyValueStore,
        Effect.flatMap((kv) => kv.set(key, JSON.stringify(json)))
      )
    )
  )
  return Effect.provide(effect, BrowserKeyValueStore.layerLocalStorage)
}

export const setEndpoints = (endpoints: EndpointMap) =>
  setLocalStorage(endpoints, KEY_ENDPOITNS, EndpointMapSchema)

export const setTheme = (theme: Theme) =>
  setLocalStorage(theme, KEY_THEME, ThemeSchema)
