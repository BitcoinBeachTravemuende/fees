import type * as App from '../types'

import * as S from '@effect/schema/Schema'
import { Effect as E, Layer, pipe } from 'effect'
import { urlWithDefault } from '../util/url'
import * as C from './common'

export const DEFAULT_ENDPOINT_URL = 'https://api.blockchain.info/mempool/fees'

export const defaultUrl = () =>
  urlWithDefault(import.meta.env.VITE_URL_BLOCKCHAIN, DEFAULT_ENDPOINT_URL)

const FeesSchema = S.struct({
  regular: S.number,
  priority: S.number,
  limits: S.struct({
    min: S.number,
  }),
})

type Fees = S.Schema.To<typeof FeesSchema>

const toFees = (fees: Fees): E.Effect<App.Fees, never> =>
  E.succeed({
    fast: fees.priority,
    medium: fees.regular,
    slow: fees.limits.min,
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
