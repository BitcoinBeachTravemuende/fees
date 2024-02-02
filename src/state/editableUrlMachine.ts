import { assign, not, setup } from 'xstate'

import { isValidUrl } from '../util/url'

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
    }
    input: { url: URL }
  },
  guards: {
    validateValue: ({ context }) => isValidUrl(context.enteredValue),
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
  }),

  initial: 'idle',
  states: {
    idle: {
      on: {
        edit: 'edit',
      },
    },
    edit: {
      initial: 'editing',
      states: {
        editing: {},
        invalid: {},
      },
      on: {
        cancel: {
          target: 'idle',
          actions: assign(({ context }) => ({
            ...context,
            enteredValue: context.url.toString(),
          })),
        },
        save: [
          {
            guard: not('validateValue'),
            target: '.invalid',
          },
          {
            guard: 'validateValue',
            target: '#editableUrlM.saved',
            actions: [
              assign(({ context }) => ({
                ...context,
                url: new URL(context.enteredValue),
              })),
              {
                type: 'onSaveHandler',
                params: ({ context }) => ({
                  url: new URL(context.enteredValue),
                }),
              },
            ],
          },
        ],
        updated: {
          target: '.editing',
          actions: assign(({ context, event }) => ({
            ...context,
            enteredValue: event.data.value,
          })),
        },
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
