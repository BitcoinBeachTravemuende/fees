import { describe, expect, test } from 'vitest'
import { UrlSchema, isUrl, urlWithDefault } from './url'
import { Effect, pipe, Option as O } from 'effect'
import * as S from '@effect/schema/Schema'

describe('isUrl', () => {
  test('true', () => {
    expect(isUrl(new URL('https://example.com'))).toBeTruthy()
  })
  test('false', () => {
    expect(isUrl(null)).toBeFalsy()
    expect(isUrl(undefined)).toBeFalsy()
    expect(isUrl('unknown')).toBeFalsy()
  })
})

describe('urlWithDefault', () => {
  test('valid url -> no default', () => {
    const result = pipe(
      urlWithDefault('https://google.com', 'https://google.de'),
      Effect.runSync
    )
    expect(result).toStrictEqual(new URL('https://google.com'))
  })

  test('invalid url -> valid default', () => {
    const result = pipe(
      urlWithDefault('888', 'https://google.de'),
      Effect.runSync
    )
    expect(result.hostname).toBe('google.de')
  })

  test('invalid url -> invalid default', async () => {
    await expect(
      pipe(urlWithDefault('888', '222'), Effect.runPromise)
    ).rejects.toThrow()
  })
})

describe('UrlSchema', () => {
  test('decode valid', () => {
    const url = 'https://example.com'
    const result = pipe(url, S.decodeSync(UrlSchema))
    expect(result).toStrictEqual(new URL(url))
  })

  test('decode invalid', () => {
    const result = pipe('invalid-url', S.decodeOption(UrlSchema))
    expect(result).toStrictEqual(O.none())
  })

  test('encode', () => {
    const url = 'https://example.com/?query=1'
    const result = pipe(new URL(url), S.encodeSync(UrlSchema))
    expect(result).toEqual(url)
  })
})
