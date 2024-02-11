import { assign, fromCallback, fromPromise, setup } from 'xstate'

import { Effect, Option as O, pipe } from 'effect'

import type {
  Endpoint,
  EndpointMap,
  Fees,
  FeesAsync,
  GetFeeError,
} from '../types'
import * as AD from '../util/async'
import * as Mempool from '../api/mempool'
import * as Esplora from '../api/esplora'
import * as RpcExplorer from '../api/rpc-explorer'
import * as Bitgo from '../api/bitgo'
import * as Blockcypher from '../api/blockcypher'
import * as Blockchain from '../api/blockchain'
import * as Storage from '../util/storage'
import { INTERVAL_MS, MAX_TICK_MS } from './store'
import { FeesService } from '../api/common'

const MAX_RETRIES = 2

export const machine = setup({
  types: {} as {
    events:
      | { type: 'fees.load' }
      | { type: 'fees.tick' }
      | { type: 'endpoint.change'; endpoint: Endpoint }
      | { type: 'endpoint.update'; data: { endpoint: Endpoint; url: URL } }
    context: {
      selectedEndpoint: Endpoint
      endpoints: EndpointMap
      ticks: number
      fees: FeesAsync
      retries: number
    }
    input: {
      endpoints: EndpointMap
      selectedEndpoint: Endpoint
    }
    actions: {
      type: 'storeEndpoints'
      params: {
        endpoints: EndpointMap
      }
    }
  },
  actors: {
    fetchFeesActor: fromPromise(
      async ({ input }: { input: { endpoint: Endpoint; url: URL } }) => {
        const effect: Effect.Effect<Fees, GetFeeError, 'FeesService'> = pipe(
          FeesService,
          Effect.flatMap((service) => service.getFees(input.url))
        )
        switch (input.endpoint) {
          case 'mempool':
            return Effect.runPromise(
              Effect.provide(effect, Mempool.FeesServiceLayer)
            )
          case 'rpc-explorer':
            return Effect.runPromise(
              Effect.provide(effect, RpcExplorer.FeesServiceLayer)
            )
          case 'esplora':
            return Effect.runPromise(
              Effect.provide(effect, Esplora.FeesServiceLayer)
            )
          case 'bitgo':
            return Effect.runPromise(
              Effect.provide(effect, Bitgo.FeesServiceLayer)
            )
          case 'blockcypher':
            return Effect.runPromise(
              Effect.provide(effect, Blockcypher.FeesServiceLayer)
            )
          case 'blockchain':
            return Effect.runPromise(
              Effect.provide(effect, Blockchain.FeesServiceLayer)
            )
        }
      }
    ),
    tickActor: fromCallback<
      { type: 'fees.tick' } | { type: 'fees.load' },
      { interval: number }
    >(({ sendBack, input }) => {
      const id = setInterval(() => {
        sendBack({ type: 'fees.tick' })
      }, input.interval)
      return () => clearInterval(id)
    }),
  },
  delays: {
    RETRY_DELAY: ({ context }) => context.retries * 1000,
  },
  guards: {
    checkRetry: ({ context }) => context.retries < MAX_RETRIES,
    checkLastRetry: ({ context }) => context.retries >= MAX_RETRIES,
    hasFeesLoaded: ({ context }) => AD.isSuccess(context.fees),
    checkTick: ({ context }) => context.ticks * INTERVAL_MS < MAX_TICK_MS,
    checkMaxTick: ({ context }) => context.ticks * INTERVAL_MS >= MAX_TICK_MS,
  },
  actions: {
    storeEndpoints: async (
      _,
      params: {
        endpoints: EndpointMap
      }
    ) => {
      await Effect.runPromise(Storage.setEndpoints(params.endpoints))
    },
  },
}).createMachine({
  id: 'app',
  context: ({ input }) => ({
    selectedEndpoint: input.selectedEndpoint,
    endpoints: input.endpoints,
    fees: AD.initial(O.none()),
    ticks: 0,
    retries: 0,
  }),

  initial: 'idle',
  states: {
    idle: {},
    ticker: {
      invoke: {
        src: 'tickActor',
        input: () => ({
          interval: INTERVAL_MS,
        }),
      },
    },
    loading: {
      invoke: {
        src: 'fetchFeesActor',
        input: ({ context }) => ({
          endpoint: context.selectedEndpoint,
          url: context.endpoints[context.selectedEndpoint],
        }),
        onDone: {
          target: 'ticker',
          actions: assign(({ event }) => ({
            fees: AD.success(event.output),
            retries: 0,
          })),
        },
        onError: [
          {
            guard: 'checkRetry',
            target: 'retry',
            actions: assign(({ context }) => ({
              retries: context.retries + 1,
            })),
          },
          {
            guard: 'checkLastRetry',
            target: 'idle',
            actions: assign(({ event }) => ({
              fees: AD.fail(event.error as unknown as GetFeeError),
            })),
          },
        ],
      },
    },
    retry: {
      after: {
        RETRY_DELAY: {
          target: 'loading',
        },
      },
    },
  },
  // TODO: Loading fees in 'idle' state only?
  on: {
    'endpoint.change': {
      target: '.loading',
      actions: assign(({ context, event }) => ({
        fees: pipe(context.fees, AD.getValue, AD.loading),
        selectedEndpoint: event.endpoint,
        retries: 0,
        ticks: 0,
      })),
    },
    'endpoint.update': {
      target: '.loading',
      actions: [
        assign(({ context, event }) => ({
          fees: pipe(context.fees, AD.getValue, AD.loading),
          url: event.data.url,
          selectedEndpoint: event.data.endpoint,
          endpoints: {
            ...context.endpoints,
            [event.data.endpoint]: event.data.url,
          },
          retries: 0,
          ticks: 0,
        })),
        {
          type: 'storeEndpoints',
          params: ({ context, event }) => ({
            endpoints: {
              ...context.endpoints,
              [event.data.endpoint]: event.data.url,
            },
          }),
        },
      ],
    },
    'fees.load': {
      target: '.loading',
      actions: assign(({ context }) => ({
        fees: pipe(context.fees, AD.getValue, AD.loading),
        retries: 0,
        ticks: 0,
      })),
    },
    'fees.tick': [
      {
        guard: 'checkMaxTick',
        target: '.loading',
        actions: [
          assign(({ context }) => ({
            fees: pipe(context.fees, AD.getValue, AD.loading),
            ticks: 0,
          })),
        ],
      },
      {
        guard: 'checkTick',
        actions: [
          assign({
            ticks: ({ context }) => context.ticks + 1,
          }),
        ],
      },
    ],
  },
})
