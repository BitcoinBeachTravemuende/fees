import { describe, expect, test } from 'vitest'
import {
  EndpointMapSchema,
  EndpointSchema,
  isEndpoint,
  type EndpointMap,
} from './types'
import * as S from '@effect/schema/Schema'
import { pipe, Either as E, Effect } from 'effect'

describe('Endpoint', () => {
  test('isEndpoint', () => {
    // true
    expect(isEndpoint('mempool')).toBeTruthy()
    expect(isEndpoint('esplora')).toBeTruthy()
    // false
    expect(isEndpoint('')).toBeFalsy()
    expect(isEndpoint('unknown')).toBeFalsy()
  })
})

describe('EndpointSchema', () => {
  test('decode valid', async () => {
    await pipe(
      'mempool',
      S.decodeUnknown(EndpointSchema),
      Effect.map((result) => expect(result).toEqual('mempool')),
      Effect.runPromise
    )
  })

  test('decode invalid', async () => {
    await expect(
      pipe('mempool2', S.decodeUnknown(EndpointSchema), Effect.runPromise)
    ).rejects.toThrow()
  })

  test('encode', async () => {
    await pipe(
      'mempool',
      S.encode(EndpointSchema),
      Effect.map((result) => expect(result).toEqual('mempool')),
      Effect.runPromise
    )
  })
})

describe('EndpointMapSchema', () => {
  const endpointMap: EndpointMap = {
    mempool: new URL('https://example.com/api/'),
    esplora: new URL('https://example2.com/api/fees'),
  }

  const endpointMapJSON = {
    mempool: 'https://example.com/api/',
    esplora: 'https://example2.com/api/fees',
  }

  const endpointMapString = JSON.stringify(endpointMapJSON)

  test('decode string -> valid', () => {
    const result = pipe(
      endpointMapString,
      S.decodeSync(S.parseJson(EndpointMapSchema))
    )
    expect(result).toEqual(endpointMap)
  })

  test('decode json -> valid', () => {
    const result = pipe(endpointMapJSON, S.decodeSync(EndpointMapSchema))
    expect(result).toEqual(endpointMap)
  })

  test('decode invalid', async () => {
    await expect(
      pipe(
        "{ hello: 'world' }",
        S.decodeUnknown(EndpointMapSchema),
        Effect.runPromise
      )
    ).rejects.toThrow()
  })

  test('encode -> JSON', () => {
    const result = pipe(endpointMap, S.encodeSync(EndpointMapSchema))
    expect(result).toEqual(endpointMapJSON)
  })

  test('encode -> string', () => {
    const result = pipe(
      endpointMap,
      S.encodeSync(EndpointMapSchema),
      JSON.stringify
    )
    expect(result).toEqual(endpointMapString)
  })
})
