import { EndpointSchema, type EndpointMap } from '../types'
import * as S from '@effect/schema/Schema'
import * as Mempool from '../api/mempool'
import * as Esplora from '../api/esplora'
import * as Bitgo from '../api/bitgo'
import * as Rpc from '../api/rpc-explorer'

const defaultEndpointMap = (): EndpointMap => ({
  mempool: new URL(Mempool.DEFAULT_ENDPOINT_URL),
  esplora: new URL(Esplora.DEFAULT_ENDPOINT_URL),
  bitgo: new URL(Bitgo.DEFAULT_ENDPOINT_URL),
  'rpc-explorer': new URL(Rpc.DEFAULT_ENDPOINT_URL),
})

export const mockEndpointMap = (
  custom?: Partial<EndpointMap>
): EndpointMap => ({
  ...defaultEndpointMap(),
  ...custom,
})

const EndpointMapJSONSchema = S.record(EndpointSchema, S.string)
type EndpointMapJSON = S.Schema.To<typeof EndpointMapJSONSchema>

const defaultEndpointMapJSON = (): EndpointMapJSON => ({
  mempool: Mempool.DEFAULT_ENDPOINT_URL,
  esplora: Esplora.DEFAULT_ENDPOINT_URL,
  bitgo: Bitgo.DEFAULT_ENDPOINT_URL,
  'rpc-explorer': Rpc.DEFAULT_ENDPOINT_URL,
})

export const mockEndpointMapJSON = (
  custom?: Partial<EndpointMapJSON>
): EndpointMapJSON => ({
  ...defaultEndpointMapJSON(),
  ...custom,
})
