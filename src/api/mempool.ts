import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Effect as E, Layer, pipe } from 'effect'
import { urlWithDefault } from '../util/url'
import * as C from './common'

export const DEFAULT_ENDPOINT_URL =
  'https://mempool.space/api/v1/fees/recommended'

export const defaultUrl = (): E.Effect<URL, Error, never> =>
  urlWithDefault(import.meta.env.VITE_URL_MEMPOOL, DEFAULT_ENDPOINT_URL)

const FeesSchema = S.struct({
  fastestFee: S.number,
  halfHourFee: S.number,
  hourFee: S.number,
})

type Fees = S.Schema.To<typeof FeesSchema>

const toFees = (fees: Fees): E.Effect<App.Fees, never, never> =>
  E.succeed({
    fast: fees.fastestFee,
    medium: fees.halfHourFee,
    slow: fees.hourFee,
  })

export const FeesServiceLayer = Layer.succeed(
  C.FeesService,
  C.FeesService.of({
    getFees: (url: URL) =>
      pipe(
        url,
        C.fetchFees,
        E.flatMap(C.getJson),
        E.flatMap(S.decodeUnknown(FeesSchema)),
        E.flatMap(toFees)
      ),
  })
)
