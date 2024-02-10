import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Effect as E, Layer, pipe } from 'effect'
import { urlWithDefault } from '../util/url'
import * as C from './common'

export const DEFAULT_ENDPOINT_URL = 'https://www.bitgo.com/api/v2/btc/tx/fee'

export const defaultUrl = () =>
  urlWithDefault(import.meta.env.VITE_URL_BITGO, DEFAULT_ENDPOINT_URL)

const FeesSchema = S.struct({
  feeByBlockTarget: S.struct({
    '1': S.number,
    '3': S.number,
    '6': S.number,
  }),
})

type Fees = S.Schema.To<typeof FeesSchema>

const toFees = (fees: Fees): E.Effect<App.Fees, never> =>
  E.succeed({
    // sat/kB / 1000 = sat/Byte
    fast: fees.feeByBlockTarget['1'] / 1000,
    medium: fees.feeByBlockTarget['3'] / 1000,
    slow: fees.feeByBlockTarget['6'] / 1000,
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
