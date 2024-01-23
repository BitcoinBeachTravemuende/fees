import { assign, fromPromise, setup } from 'xstate'

import { Effect, Option as O, pipe } from 'effect'

import type { Endpoint, FeesAsync, GetFeeError } from '../types'
import { fail, initial, loading, success, value } from '../util/async'
import { getMempoolFees } from '../api'

const MAX_RETRIES = 2

export const machine = setup({
  types: {} as {
    events:
      | { type: 'fees.load' }
      | { type: 'endpoint.change'; endpoint: Endpoint }
    context: {
      endpoint: Endpoint
      fees: FeesAsync
      retries: number
    }
  },
  actors: {
    fetchFees: fromPromise(
      async ({ input }: { input: { endpoint: Endpoint } }) => {
        console.log('ACTOR fetchFees:', input.endpoint)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return Effect.runPromise(getMempoolFees)
      }
    ),
  },
  delays: {
    RETRY_DELAY: ({ context }) => context.retries * 1000,
  },
  guards: {
    checkRetry: ({ context }) => context.retries < MAX_RETRIES,
    checkLastRetry: ({ context }) => context.retries >= MAX_RETRIES,
  },
}).createMachine({
  id: 'app',
  context: {
    endpoint: 'mempool',
    fees: initial(O.none()),
    retries: 0,
  },

  initial: 'idle',
  states: {
    idle: {},
    loading: {
      invoke: {
        src: 'fetchFees',
        input: ({ context }) => ({ endpoint: context.endpoint }),
        onDone: {
          target: 'idle',
          actions: [
            assign({
              fees: ({ event }) => success(event.output),
              retries: 0,
            }),
          ],
        },
        onError: [
          {
            guard: 'checkRetry',
            target: 'retry',
            actions: assign({
              retries: ({ context }) => context.retries + 1,
            }),
          },
          {
            guard: 'checkLastRetry',
            target: 'idle',
            actions: assign({
              fees: ({ event }) => fail(event.error as unknown as GetFeeError),
            }),
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
    'fees.load': {
      target: '.loading',
      actions: assign({
        fees: ({ context }) => pipe(context.fees, value, loading),
        retries: 0,
      }),
    },
  },
})
