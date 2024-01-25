import { expect, test } from 'vitest'
import { urlWithDefault } from './url'
import { Effect, pipe } from 'effect'

test('valid url', async () => {
  await pipe(
    urlWithDefault('https://google.com', 'https://google.de'),
    Effect.map((url) => expect(url.hostname).toBe('google.com')),
    Effect.runPromise
  )
})

test('invalid url -> valid default', async () => {
  await pipe(
    urlWithDefault('888', 'https://google.de'),
    Effect.map((url) => expect(url.hostname).toBe('google.de')),
    Effect.runPromise
  )
})

test('invalid url -> invalid default', async () => {
  await expect(
    pipe(urlWithDefault('888', '222'), Effect.runPromise)
  ).rejects.toThrow()
})
