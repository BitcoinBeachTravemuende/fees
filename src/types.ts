import type { ParseError } from '@effect/schema/ParseResult'
import * as S from '@effect/schema/Schema'
import type { ConfigError } from 'effect/ConfigError'
import type { AsyncData } from './util/async'

export const ENDPOINTS = ['mempool', 'esplora'] as const
export type Endpoint = (typeof ENDPOINTS)[number]

export type EndpointMap = Record<Endpoint, URL>

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

// Utility to get typed entries from an Object
// Error when iterating over an object in a Svelte component
// https://stackoverflow.com/a/75404225
export const entries = <K extends string, V>(o: Record<K, V>) =>
  Object.entries(o) as [K, V][]
