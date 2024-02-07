import * as KeyValueStore from '@effect/platform-browser/KeyValueStore'

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

const getLocalStorage = <R, I, A>(key: string, schema: S.Schema<R, I, A>) =>
  pipe(
    KeyValueStore.KeyValueStore,
    Effect.flatMap((kv) => kv.get(key)),
    // In case there is no value, set empty string to break decoding in next step
    Effect.map(O.getOrElse(() => '')),
    Effect.flatMap(S.decodeUnknown(S.parseJson(schema)))
  )

export const getEndpoints = () =>
  getLocalStorage(KEY_ENDPOITNS, EndpointMapSchema)

export const getTheme = () => getLocalStorage(KEY_THEME, ThemeSchema)

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
  setLocalStorage(endpoints, KEY_ENDPOITNS, EndpointMapSchema)

export const setTheme = (theme: Theme) =>
  setLocalStorage(theme, KEY_THEME, ThemeSchema)
