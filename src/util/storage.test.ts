import { beforeEach, describe, expect, test } from 'vitest'
import { Effect, pipe, Option as O } from 'effect'

import { getEndpoints, setEndpoints } from './storage'
import { KeyValueStore } from '@effect/platform-browser'
import type { EndpointMap } from '../types'
import { mockEndpointMap } from '../test/mocks'

describe('Storage', () => {
  const endpointMap: EndpointMap = mockEndpointMap()

  beforeEach(() => {
    const clearEff = pipe(
      KeyValueStore.KeyValueStore,
      Effect.map((kv) => kv.clear)
    )

    Effect.runSync(Effect.provide(clearEff, KeyValueStore.layerLocalStorage))
  })

  test('set / get endpoints', () => {
    // set
    Effect.runSync(
      Effect.provide(setEndpoints(endpointMap), KeyValueStore.layerLocalStorage)
    )
    // get
    const result = Effect.runSync(
      Effect.provide(getEndpoints(), KeyValueStore.layerLocalStorage)
    )
    // test
    expect(result).toStrictEqual(endpointMap)
  })
})
