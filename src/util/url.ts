import { Effect, pipe } from 'effect'

export const validateUrl = (url: string): Effect.Effect<never, Error, URL> =>
  Effect.try({
    try: () => new URL(url),
    catch: () => Error(`Invalid url "${url}" `),
  })

export const isValidUrl = (url: string) =>
  Effect.runSync(
    pipe(
      validateUrl(url),
      Effect.map<URL, boolean>(() => true),
      Effect.orElse(() => Effect.sync(() => false))
    )
  )

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
