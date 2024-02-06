import { beforeEach, describe, expect, test } from 'vitest'
import { Effect, pipe, Option as O } from 'effect'
import * as S from '@effect/schema/Schema'
import { defaultEndpoints, getEndpoints, setEndpoints } from './store'
import { KeyValueStore } from '@effect/platform-browser'
import type { EndpointMap } from '../types'

describe('Storage', () => {
  const endpointMap: EndpointMap = {
    mempool: new URL('http://umbrl-pi:3006/api/v1/fees/recommended'),
    esplora: new URL('https://blockstream.info/api/fee-estimates'),
  }

  beforeEach(() => {
    const clearEff = pipe(
      KeyValueStore.KeyValueStore,
      Effect.map((kv) => kv.clear)
    )

    Effect.runSync(Effect.provide(clearEff, KeyValueStore.layerLocalStorage))
  })

  test('get defaultEndpoints', () => {
    const result = Effect.runSync(
      Effect.provide(defaultEndpoints, KeyValueStore.layerLocalStorage)
    )
    expect(result).toStrictEqual(endpointMap)
  })

  test('set / get endpoints', () => {
    Effect.runSync(
      Effect.provide(setEndpoints(endpointMap), KeyValueStore.layerLocalStorage)
    )

    const result = Effect.runSync(
      Effect.provide(getEndpoints(), KeyValueStore.layerLocalStorage)
    )

    expect(result).toStrictEqual(endpointMap)
  })
})
