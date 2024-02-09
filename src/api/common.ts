import { Context, Effect as E } from 'effect'
import type { GetFeeError, Fees } from '../types'

interface FeesService {
  readonly getFees: (url: URL) => E.Effect<Fees, GetFeeError, never>
}

export const FeesService = Context.GenericTag<'FeesService', FeesService>(
  '@app/FeesService'
)

export const fetchFees = (url: URL) =>
  E.tryPromise({
    try: () => fetch(url),
    catch: (unknown) => new Error(`Could not fetch fees ${unknown}`),
  })

export const getJson = (res: Response): E.Effect<unknown, Error, never> =>
  E.tryPromise({
    try: () => res.json() as Promise<unknown>, // Promise<any> otherwise
    catch: (unknown) => new Error(`JSON not provided ${unknown}`),
  })
