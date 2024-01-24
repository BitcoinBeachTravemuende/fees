import { parseEither } from '@effect/schema/Parser'
import { Effect as E, Effect, pipe } from 'effect'
import * as S from '@effect/schema/Schema'
import { Config as C } from 'effect'
import type { GetFeeError, Fees } from '../types'
import * as M from './mempool'

const fetchFees = (url: string): E.Effect<never, Error, Response> =>
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
  url: string
  schema: S.Schema<T>
  toFees: (fees: T) => E.Effect<never, never, Fees>
}): E.Effect<never, GetFeeError, Fees> =>
  pipe(
    url,
    fetchFees,
    E.flatMap(getJson),
    E.flatMap(parseEither(schema)),
    E.flatMap(toFees),
    E.tap((f) => Effect.log(`fees ${JSON.stringify(f, null, 2)}`))
  )

export const getMempoolFees = getFees({
  url: M.URL,
  schema: M.Fees,
  toFees: M.toFees,
})