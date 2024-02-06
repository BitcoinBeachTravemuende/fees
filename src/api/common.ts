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
  url: URL
  schema: S.Schema<never, T>
  toFees: (fees: T) => E.Effect<never, never, Fees>
}): E.Effect<never, GetFeeError, Fees> =>
  pipe(
    url,
    fetchFees,
    E.flatMap(getJson),
    E.flatMap(S.decodeUnknown(schema)),
    E.flatMap(toFees),
    E.tap((f) => E.log(`fees ${JSON.stringify(f, null, 2)}`))
  )
