import { Effect, pipe } from 'effect'

export const validateUrl = (url: string): Effect.Effect<never, Error, URL> =>
  Effect.try({
    try: () => new URL(url),
    catch: () => (!url.length ? Error('Empty url') : Error(`Invalid url`)),
  })

export const urlWithDefault = (
  url: string,
  defaultValue: string
): Effect.Effect<never, Error, URL> =>
  pipe(
    url,
    validateUrl,
    // In case given url is invalid,
    // use default value, but still validate it
    Effect.orElse(() => validateUrl(defaultValue))
  )
