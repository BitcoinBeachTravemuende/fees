import { assign, fromPromise, setup } from 'xstate'

import { validateUrl } from '../util/url'
import { Effect, pipe } from 'effect'

export const machine = setup({
  types: {} as {
    events:
      | { type: 'edit' }
      | { type: 'cancel' }
      | { type: 'save' }
      | { type: 'updated'; data: { value: string } }
    context: {
      url: URL
      enteredValue: string
      errorMsg: string
    }
    input: { url: URL }
  },
  actors: {
    validateValue: fromPromise(
      async ({ input }: { input: { value: string } }) =>
        pipe(input.value, validateUrl, Effect.runPromise)
    ),
  },
  actions: {
    onSaveHandler: (_, params: { url: URL }) => {
      console.log('success from MACHINE', params.url.toString())
    },
  },
}).createMachine({
  id: 'editableUrlM',
  context: ({ input }) => ({
    url: input.url,
    enteredValue: input.url.toString(),
    errorMsg: '',
  }),

  initial: 'idle',
  states: {
    idle: {
      on: {
        edit: 'edit',
      },
    },
    edit: {
      initial: 'valid',
      on: {
        cancel: {
          target: '#editableUrlM.idle',
          actions: assign(({ context }) => ({
            enteredValue: context.url.toString(),
          })),
        },

        updated: {
          target: '.validating',
          actions: assign(({ event }) => ({
            enteredValue: event.data.value,
          })),
        },
      },
      states: {
        validating: {
          invoke: {
            input: ({ context: { enteredValue } }) => ({
              value: enteredValue,
            }),
            src: 'validateValue',
            onDone: 'valid',
            onError: {
              target: 'invalid',
              actions: assign(({ event }) => {
                const error = event.error as unknown as Error
                return {
                  errorMsg: error?.message ?? error.toString(),
                }
              }),
            },
          },
        },
        valid: {
          on: {
            save: {
              target: '#editableUrlM.saved',
              actions: assign(({ context }) => ({
                url: new URL(context.enteredValue),
              })),
            },
          },
        },
        invalid: {},
      },
    },
    saved: {
      after: {
        1000: {
          target: 'idle',
        },
      },
    },
  },
})
