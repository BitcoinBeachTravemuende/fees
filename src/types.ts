import type { ParseError } from '@effect/schema/ParseResult'
import * as S from '@effect/schema/Schema'
import type { AsyncData } from './util/async'
import { UrlSchema } from './util/url'

export const ThemeSchema = S.parseJson(S.literal('dark', 'light'))

export type Theme = S.Schema.To<typeof ThemeSchema>

const ENDPOINTS = [
  'mempool',
  'esplora',
  'rpc-explorer',
  'bitgo',
  'blockcypher',
  'blockchain',
] as const

export const EndpointSchema = S.literal(...ENDPOINTS)

export type Endpoint = S.Schema.To<typeof EndpointSchema>

export const EndpointMapSchema = S.parseJson(
  S.record(EndpointSchema, UrlSchema)
)

export type EndpointMap = S.Schema.To<typeof EndpointMapSchema>

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

export type GetFeeError = Error | ParseError

export type FeesAsync = AsyncData<GetFeeError, Fees>

// Utility to get typed entries from an Object
// Error when iterating over an object in a Svelte component
// https://stackoverflow.com/a/75404225
export const entries = <K extends string, V>(o: Record<K, V>) =>
  Object.entries(o) as [K, V][]
