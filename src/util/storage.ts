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

const getLocalStorage = <A>(
  key: string,
  schema: S.Schema<A, string, never>
) => {
  const effect = pipe(
    KeyValueStore.KeyValueStore,
    Effect.flatMap((kv) => kv.get(key)),
    // In case there is no value, set empty string to break decoding in next step
    Effect.map(O.getOrElse(() => '')),
    Effect.flatMap(S.decodeUnknown(schema))
  )
  return Effect.provide(effect, BrowserKeyValueStore.layerLocalStorage)
}

export const getEndpoints = () =>
  getLocalStorage(KEY_ENDPOITNS, EndpointMapSchema)

export const getTheme = () => getLocalStorage(KEY_THEME, ThemeSchema)

const setLocalStorage = <A>(
  value: A,
  key: string,
  schema: S.Schema<A, string, never>
) => {
  const effect = pipe(
    value,
    S.encode(schema),
    Effect.flatMap((encoded) =>
      pipe(
        KeyValueStore.KeyValueStore,
        Effect.flatMap((kv) => kv.set(key, encoded))
      )
    )
  )
  return Effect.provide(effect, BrowserKeyValueStore.layerLocalStorage)
}

export const setEndpoints = (endpoints: EndpointMap) =>
  setLocalStorage(endpoints, KEY_ENDPOITNS, EndpointMapSchema)

export const setTheme = (theme: Theme) =>
  setLocalStorage(theme, KEY_THEME, ThemeSchema)
