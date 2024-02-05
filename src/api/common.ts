import { parseEither } from '@effect/schema/Parser'
import { Effect as E, pipe } from 'effect'
import * as S from '@effect/schema/Schema'
import type { GetFeeError, Fees } from '../types'

const fetchFees = (url: URL): E.Effect<never, Error, Response> =>
  E.tryPromise({
    try: () => fetch(url),
    catch: (unknown) => new Error(`Could not fetch fees ${unknown}`),
  })

const getJson = (res: Response): E.Effect<never, Error, unknown> =>
  E.tryPromise({
    try: () => res.json() as Promise<unknown>, // Promise<any> otherwise
    catch: (unknown) => new Error(`JSON not provided ${unknown}`),
  })

export const getFees = <T>({
  url,
  schema,
  toFees,
}: {
  url: E.Effect<never, Error, URL>
  schema: S.Schema<T>
  toFees: (fees: T) => E.Effect<never, never, Fees>
}): E.Effect<never, GetFeeError, Fees> =>
  pipe(
    url,
    E.flatMap(fetchFees),
    E.flatMap(getJson),
    E.flatMap(parseEither(schema)),
    E.flatMap(toFees),
    E.tap((f) => E.log(`fees ${JSON.stringify(f, null, 2)}`))
  )
