import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Effect as E } from 'effect'
import { urlWithDefault } from '../util/url'
import * as C from './common'

const url = urlWithDefault(
  import.meta.env.VITE_URL_RPC_EXPLORER,
  'https://bitcoinexplorer.org/api/mempool/fees'
)

const Fees = S.struct({
  nextBlock: S.number,
  '30min': S.number,
  '60min': S.number,
})

type Fees = S.Schema.To<typeof Fees>

const toFees = (fees: Fees): E.Effect<never, never, App.Fees> =>
  E.succeed({
    fast: fees.nextBlock,
    medium: fees['30min'],
    slow: fees['60min'],
  })

export const getFees = C.getFees({
  url,
  schema: Fees,
  toFees,
})