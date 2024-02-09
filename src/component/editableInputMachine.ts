import { assign, fromPromise, setup } from 'xstate'

import { Effect, pipe } from 'effect'

type ValidateValue<T> = (_: string) => Effect.Effect<T, Error, never>

export const mkMachine = <T extends { toString: () => string }>() =>
  setup({
    types: {} as {
      events:
        | { type: 'edit' }
        | { type: 'cancel' }
        | { type: 'save' }
        | { type: 'updated'; data: { value: string } }
      context: {
        value: T
        enteredValue: string
        errorMsg: string
        toValue: (_: string) => T
        validateValue: ValidateValue<T>
      }
      input: {
        value: T
        toValue: (_: string) => T
        validateValue: ValidateValue<T>
      }
    },
    actors: {
      validateValue: fromPromise(
        async ({
          input,
        }: {
          input: { value: string; validateValue: ValidateValue<T> }
        }) => pipe(input.value, input.validateValue, Effect.runPromise)
      ),
    },
    actions: {
      onSaveHandler: (_, _params: { value: T }) => {},
    },
  }).createMachine({
    id: 'editableUrlM',
    context: ({ input }) => ({
      value: input.value,
      enteredValue: input.value.toString(),
      errorMsg: '',
      toValue: input.toValue,
      validateValue: input.validateValue,
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
              enteredValue: context.value.toString(),
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
              input: ({ context }) => ({
                value: context.enteredValue,
                validateValue: context.validateValue,
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
                  value: context.toValue(context.enteredValue),
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
