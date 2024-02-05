import { assign, fromPromise, setup } from 'xstate'

import { Effect, Option as O, pipe } from 'effect'

type ValidateValue<T> = (_: string) => Effect.Effect<never, Error, T>

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
      onSaveHandler: (_, params: { value: T }) => {
        console.log(`success from MACHINE ${params.value}`)
      },
    },
  }).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5SQJYBcCGAjANmAqgE44CyAdChHgMSpoDaADALqKgAOA9rOipwHZsQAD0QBWAEwAaEAE9EADgCMZMY3VKALADZGaiQE4xYgL4mZdbHiKkydagGMM-B2BxNWSEFx5o+gr1EEAHZglUZg5UMFBWDtBTEZeQQAZk0DMgM4sXTJBW0U4NNzcAh0KwJicnsAV3YIDDRIDyEfXgEhINikxAkFFLJ0gwME7WijJWKLMsxcSts6MgA3DBxKRpR+KGoIATAKfiXOAGt9yzmbapnl1fW-LYRNo6c-AQ8WrzbXgNAgzQkBiklBI1Op4spCikeqkCmRgowgcDNIUDCkUmJtGZpuULlU7NcVmsGvdtmBCIROIQyOwcI0AGaUgC2+Jx1jxi0Jd02UEeh04L387xYrW47R+IkQ-0BwNBjHBSkh0Ik8LhQ0i6k0SmCBm0mixpVZ8yu6BuROosAwSzAHw4ou+nUQoXCkWBI1i8UScl6KUYcIk2mMfXiaLCepK5zZtgtVog1GEsEwTTIGDpTUIAAolOpGABKWgzCqXMjR5rCz52-wOhBZxiaMjaML5CKaTRifLaJU5TJiRFiUJxNFaswlficCBwIQRo0i3yVwKIAC0BmhC7EmWGG83G-y+qnRcoeBnYqrSmB2jISLdkU0taUCk759bQJRamRhUx4YLuIWMyP9vnqTLl61b9GQIIaMoyIYgYyK7l+kbGmgppclsf5zr8vRZqoQLgdokwpAYjDSMBfQDBI-o5JIup3toAZwYaRYcrcEBoR0AF4XWERRNoIw3pq0IpGMcIIlmxhiDqMFKPRswISySFPMxrHikEHFkFxZ68beSoGBIgzZJq8QgkoDbSYWeIlix5azmxGEIDEukNnewQArROjKp2AxGM+2qviGH5mEAA */
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
