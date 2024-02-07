import { describe, expect, test } from 'vitest'
import { Effect } from 'effect'
import { defaultEndpoints } from './store'
import { KeyValueStore } from '@effect/platform-browser'
import type { EndpointMap } from '../types'
import { mockEndpointMap } from '../test/mocks'

describe('Store', () => {
  test('get defaultEndpoints', () => {
    const endpointMap: EndpointMap = mockEndpointMap()

    const result = Effect.runSync(
      Effect.provide(defaultEndpoints, KeyValueStore.layerLocalStorage)
    )
    expect(result).toStrictEqual(endpointMap)
  })
})
