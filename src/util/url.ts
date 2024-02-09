import { ParseResult } from '@effect/schema'
import * as S from '@effect/schema/Schema'
import { Effect, pipe } from 'effect'

export const validateUrl = (url: string): Effect.Effect<URL, Error, never> =>
  Effect.try({
    try: () => new URL(url),
    catch: () => {
      if (!url) {
        return Error('Missing url to validate')
      } else if (!url.length) {
        return Error('Empty url')
      } else {
        return Error(`Invalid url`)
      }
    },
  })

export const urlWithDefault = (
  url: string,
  defaultValue: string
): Effect.Effect<URL, Error, never> =>
  pipe(
    url,
    validateUrl,
    // In case given url is invalid,
    // use default value, but still validate it
    Effect.orElse(() => validateUrl(defaultValue))
  )

export const isUrl = (input: unknown): input is URL => input instanceof URL

// URL schema
// Based on discussion from Effect Discord https://discord.com/channels/795981131316985866/847382157861060618/1154409555745325066
// Code mostly inspired by https://github.com/PREreview/coar-notify/blob/3ed80747b8225ed0e62c51b026a48b41b1dc49c0/src/Url.ts#L5
const URLFromSelf: S.Schema<URL, URL, never> = S.instanceOf(URL)

export const UrlSchema = S.transformOrFail(
  S.string,
  URLFromSelf,
  (s, _, ast) =>
    ParseResult.try({
      try: () => new URL(s),
      catch: () => ParseResult.type(ast, s),
    }),
  (url) => ParseResult.succeed(url.href)
)
