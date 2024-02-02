import { expect, test } from 'vitest'
import { isValidUrl, urlWithDefault, validateUrl } from './url'
import { Effect, pipe } from 'effect'

test('valid url -> no default', async () => {
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

test('isValidUrl -> true', () => {
  expect(isValidUrl('https://google.com')).toBeTruthy()
})
test('isValidUrl -> false', () => {
  expect(isValidUrl('google.com')).toBeFalsy()
})
