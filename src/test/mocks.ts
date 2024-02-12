import { type EndpointMap } from '../types'
import * as Mempool from '../api/mempool'
import * as Esplora from '../api/esplora'
import * as Bitgo from '../api/bitgo'
import * as Blockcypher from '../api/blockcypher'
import * as Blockchain from '../api/blockchain'
import * as Rpc from '../api/rpc-explorer'

const defaultEndpointMap = (): EndpointMap => ({
  mempool: new URL(Mempool.DEFAULT_ENDPOINT_URL),
  esplora: new URL(Esplora.DEFAULT_ENDPOINT_URL),
  'rpc-explorer': new URL(Rpc.DEFAULT_ENDPOINT_URL),
  bitgo: new URL(Bitgo.DEFAULT_ENDPOINT_URL),
  blockcypher: new URL(Blockcypher.DEFAULT_ENDPOINT_URL),
  blockchain: new URL(Blockchain.DEFAULT_ENDPOINT_URL),
})

export const mockEndpointMap = (
  custom?: Partial<EndpointMap>
): EndpointMap => ({
  ...defaultEndpointMap(),
  ...custom,
})
