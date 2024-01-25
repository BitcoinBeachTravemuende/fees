import type { ParseError } from '@effect/schema/ParseResult'
import * as S from '@effect/schema/Schema'
import type { ConfigError } from 'effect/ConfigError'
import type { AsyncData } from './util/async'

export const ENDPOINTS = ['mempool', 'esplora'] as const
export type Endpoint = (typeof ENDPOINTS)[number]

// type guard
export const isEndpoint = (value: string): value is Endpoint =>
  ENDPOINTS.map(
    // Endpoint -> string
    (e) => e.toString()
  ).includes(value)

export const Fees = S.struct({
  fast: S.number,
  medium: S.number,
  slow: S.number,
})

export type Fees = S.Schema.To<typeof Fees>

export type GetFeeError = Error | ConfigError | ParseError

export type FeesAsync = AsyncData<GetFeeError, Fees>
