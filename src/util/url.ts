import { Effect, pipe } from 'effect'

export const urlWithDefault = (
  url: string,
  defaultValue: string
): Effect.Effect<never, Error, URL> => {
  const makeURL = (url: string) =>
    Effect.try({
      try: () => new URL(url),
      catch: () => Error(`Invalid url "${url}" `),
    })

  return pipe(
    url,
    makeURL,
    Effect.orElse(() => makeURL(defaultValue))
  )
}
