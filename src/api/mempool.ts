import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Config as C, Effect as E } from 'effect'

export const url: C.Config<string> = C.withDefault(
  C.string('URL_MEMPOOL'),
  'https://mempool.space/api/v1/fees/recommended'
)

export const Fees = S.struct({
  fastestFee: S.number,
  halfHourFee: S.number,
  hourFee: S.number,
})

export type Fees = S.Schema.To<typeof Fees>

export const toFees = (fees: Fees): E.Effect<never, never, App.Fees> =>
  E.succeed({
    fast: fees.fastestFee,
    medium: fees.halfHourFee,
    slow: fees.hourFee,
  })
