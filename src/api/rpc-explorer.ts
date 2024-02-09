import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Effect as E, Layer, pipe } from 'effect'
import { urlWithDefault } from '../util/url'
import * as C from './common'

export const DEFAULT_ENDPOINT_URL =
  'https://bitcoinexplorer.org/api/mempool/fees'

export const defaultUrl = () =>
  urlWithDefault(import.meta.env.VITE_URL_RPC_EXPLORER, DEFAULT_ENDPOINT_URL)

const FeesSchema = S.struct({
  nextBlock: S.number,
  '30min': S.number,
  '60min': S.number,
})

type Fees = S.Schema.To<typeof FeesSchema>

const toFees = (fees: Fees): E.Effect<App.Fees, never, never> =>
  E.succeed({
    fast: fees.nextBlock,
    medium: fees['30min'],
    slow: fees['60min'],
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
