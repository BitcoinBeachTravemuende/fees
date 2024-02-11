import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Effect as E, Layer, pipe } from 'effect'
import { urlWithDefault } from '../util/url'
import * as C from './common'

export const DEFAULT_ENDPOINT_URL = 'https://api.blockcypher.com/v1/btc/main'

export const defaultUrl = () =>
  urlWithDefault(import.meta.env.VITE_URL_BLOCKCYPHER, DEFAULT_ENDPOINT_URL)

const FeesSchema = S.struct({
  high_fee_per_kb: S.number,
  medium_fee_per_kb: S.number,
  low_fee_per_kb: S.number,
})

type Fees = S.Schema.To<typeof FeesSchema>

const toFees = (fees: Fees): E.Effect<App.Fees, never> =>
  E.succeed({
    // sat/kB / 1000 = sat/Byte
    fast: fees.high_fee_per_kb / 1000,
    medium: fees.medium_fee_per_kb / 1000,
    slow: fees.low_fee_per_kb / 1000,
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
