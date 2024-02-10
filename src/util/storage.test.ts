import { beforeEach, describe, expect, test } from 'vitest'
import { Effect, pipe } from 'effect'

import { getEndpoints, setEndpoints } from './storage'
import { KeyValueStore } from '@effect/platform'
import { BrowserKeyValueStore } from '@effect/platform-browser'
import type { EndpointMap } from '../types'
import { mockEndpointMap } from '../test/mocks'

describe('Storage', () => {
  const endpointMap: EndpointMap = mockEndpointMap()

  beforeEach(() => {
    const clearEff = pipe(
      KeyValueStore.KeyValueStore,
      Effect.map((kv) => kv.clear)
    )

    Effect.runSync(
      Effect.provide(clearEff, BrowserKeyValueStore.layerLocalStorage)
    )
  })

  test('set / get endpoints', () => {
    // set
    Effect.runSync(setEndpoints(endpointMap))
    // get
    const result = Effect.runSync(getEndpoints())
    // test
    expect(result).toStrictEqual(endpointMap)
  })
})
