import { assign, fromCallback, fromPromise, setup } from 'xstate'

import { Effect, Option as O, pipe } from 'effect'

import type { Endpoint, FeesAsync, GetFeeError } from '../types'
import {
  fail,
  initial,
  isSuccess,
  loading,
  success,
  value,
} from '../util/async'
import { getFees as getMempoolFees } from '../api/mempool'
import { getFees as getEsploraFees } from '../api/esplora'
import { INTERVAL_MS, MAX_TICK_MS } from './store'

const MAX_RETRIES = 2

export const machine = setup({
  types: {} as {
    events:
      | { type: 'fees.load' }
      | { type: 'fees.tick' }
      | { type: 'endpoint.change'; endpoint: Endpoint }
      | { type: 'endpoint.update'; data: { endpoint: Endpoint; url: URL } }
    context: {
      endpoint: Endpoint
      url: URL
      ticks: number
      fees: FeesAsync
      retries: number
    }
    input: {
      url: URL
      endpoint: Endpoint
    }
  },
  actors: {
    fetchFeesActor: fromPromise(
      async ({ input }: { input: { endpoint: Endpoint; url: URL } }) => {
        console.log('ACTOR fetchFees:', input.endpoint)
        switch (input.endpoint) {
          case 'mempool':
            return Effect.runPromise(getMempoolFees(input.url))
          // case 'rpc':
          //   return Effect.runPromise(getRpcExplorerFees)
          case 'esplora':
            return Effect.runPromise(getEsploraFees(input.url))
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
    hasFeesLoaded: ({ context }) => isSuccess(context.fees),
    checkTick: ({ context }) => context.ticks * INTERVAL_MS < MAX_TICK_MS,
    checkMaxTick: ({ context }) => context.ticks * INTERVAL_MS >= MAX_TICK_MS,
  },
  actions: {},
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEYB2FUHsBLbAFwDoBjAC2WxgG0AGAXUVANkJMP2zZAAeiAKwB2ADQgAnogAcARjLDGKxqOEAmACyyAzFtGiAvkclpMAMzBwyAG3zIITVkhAcuPPq6EIxkmQha8hpkAJzCuvK6sgBsoaGGshomZugYVjbcFADWzvzu3Lz8Pn7SIoyyYYwx8rKhGurCwrJaKSDm6dawZFm58i7s+JyFXqA+NTFk8sIxGprRuowaS-6IMbqTssL1uqFbUdHGpu3odg4QxFAYELxgZMQAbvjZd+ZnjpcIj-gUyCPOeVcBU8xTkoi0ZC0MViGiS8lEW3CqwQsN0kIi8lmjC09VCul0bTe9g+dCwACcyfgyWRULY-hYqQBbMhE86fb6-f4sQGDYYg7yISLCMIaWoxJryRjCeRaDTIjTaMKicWiOaLWXSgnHVkkq5gClUml0kgMsnMnUXOhfbBPTmeAH9fJDDxFAUIWTgyHQ2ZwhHbYTI3TKyHVOaaUJSsTJbWnMlgEhkqQYASwEh-V4WEj6gAUACUAKIAFVzAE0APoAEXzABkAIIlgCUGDecYTUh5bmdI1BCCFIrFEqlMrlZV78JFCS0mjUFXCJmO2HwEDg-HMTr5rrGiFCyIAtDFCadCBBbGB1y7RoJEMFhBDthsgnFZCplYG9lNdA0WkEkkFMYfUB6Qgcn1c9uzdG87zxGJHz2F8YnlBQyBiURQmheRMT2GD5AA95LSgMD+S3BAYMqepam0SjUO0eVwgnURMQUZRalw1tE0IzcrwQWoyNFWQYXidQMNkeVNDIWFSKlLRGBvLUTCAA */
  id: 'app',
  context: ({ input }) => ({
    endpoint: input.endpoint,
    url: input.url,
    fees: initial(O.none()),
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
          endpoint: context.endpoint,
          url: context.url,
        }),
        onDone: {
          target: 'ticker',
          actions: assign(({ event }) => ({
            fees: success(event.output),
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
              fees: fail(event.error as unknown as GetFeeError),
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
        fees: pipe(context.fees, value, loading),
        endpoint: event.endpoint,
        retries: 0,
        ticks: 0,
      })),
    },
    'endpoint.update': {
      target: '.loading',
      actions: assign(({ context, event }) => ({
        fees: pipe(context.fees, value, loading),
        url: event.data.url,
        endpoint: event.data.endpoint,
        retries: 0,
        ticks: 0,
      })),
    },
    'fees.load': {
      target: '.loading',
      actions: assign(({ context }) => ({
        fees: pipe(context.fees, value, loading),
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
            fees: pipe(context.fees, value, loading),
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
