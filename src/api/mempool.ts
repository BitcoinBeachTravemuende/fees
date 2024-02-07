import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Effect as E } from 'effect'
import { urlWithDefault } from '../util/url'
import * as C from './common'

export const DEFAULT_ENDPOINT_URL =
  'https://mempool.space/api/v1/fees/recommended'

export const defaultUrl = () =>
  urlWithDefault(import.meta.env.VITE_URL_MEMPOOL, DEFAULT_ENDPOINT_URL)

const Fees = S.struct({
  fastestFee: S.number,
  halfHourFee: S.number,
  hourFee: S.number,
})

type Fees = S.Schema.To<typeof Fees>

const toFees = (fees: Fees): E.Effect<never, never, App.Fees> =>
  E.succeed({
    fast: fees.fastestFee,
    medium: fees.halfHourFee,
    slow: fees.hourFee,
  })

export const getFees = (url: URL) =>
  C.getFees({
    url,
    schema: Fees,
    toFees,
  })
