import type { ParseError } from '@effect/schema/ParseResult'
import * as S from '@effect/schema/Schema'
import type { ConfigError } from 'effect/ConfigError'
import type { AsyncData } from './util/async'

export type Endpoint = 'mempool' | 'rpc' | 'esplora'

export const Fees = S.struct({
  fast: S.number,
  medium: S.number,
  slow: S.number,
})

export type Fees = S.Schema.To<typeof Fees>

export type GetFeeError = Error | ConfigError | ParseError

export type FeesAsync = AsyncData<GetFeeError, Fees>
