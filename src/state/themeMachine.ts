import { assign, fromPromise, setup } from 'xstate'

import { Effect, pipe } from 'effect'
import type { Theme } from '../types'
import * as Storage from '../util/storage'
import { BrowserKeyValueStore } from '@effect/platform-browser'

export const machine = setup({
  types: {} as {
    events: { type: 'toggle' } | { type: 'light' } | { type: 'dark' }
    actions: {
      type: 'storeTheme'
      params:
        | {
            theme: Theme
          }
        | {
            type: 'updateDom'
            params: {
              theme: Theme
            }
          }
    }
  },
  actors: {
    checkTheme: fromPromise(async (_) =>
      pipe(
        Storage.getTheme(),
        Effect.orElse(() =>
          Effect.succeed<Theme>(
            window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
          )
        ),
        (effect) =>
          Effect.provide(effect, BrowserKeyValueStore.layerLocalStorage),
        Effect.runPromise
      )
    ),
  },
  actions: {
    storeTheme: async (
      _,
      params: {
        theme: Theme
      }
    ) => {
      await pipe(
        Storage.setTheme(params.theme),
        (effect) =>
          Effect.provide(effect, BrowserKeyValueStore.layerLocalStorage),
        Effect.runPromise
      )
    },
    updateDom: (
      _,
      params: {
        theme: Theme
      }
    ) => {
      const htmlClass = document.querySelector('html')!.classList
      params.theme === 'dark' ? htmlClass.add('dark') : htmlClass.remove('dark')
    },
  },
}).createMachine({
  id: 'editableUrlM',
  initial: 'idle',
  states: {
    idle: {
      invoke: {
        src: 'checkTheme',
        onDone: [
          {
            guard: ({ event }) => event.output === 'light',
            target: 'light',
          },
          {
            guard: ({ event }) => event.output === 'dark',
            target: 'dark',
          },
        ],
        onError: [
          {
            target: 'light',
            actions: assign({
              theme: 'light',
            }),
          },
        ],
      },
    },
    light: {
      entry: [
        {
          type: 'storeTheme',
          params: { theme: 'light' },
        },
        {
          type: 'updateDom',
          params: { theme: 'light' },
        },
      ],
      on: {
        toggle: {
          target: 'dark',
        },
        dark: {
          target: 'dark',
        },
      },
    },
    dark: {
      entry: [
        {
          type: 'storeTheme',
          params: { theme: 'dark' },
        },
        {
          type: 'updateDom',
          params: { theme: 'dark' },
        },
      ],
      on: {
        toggle: {
          target: 'light',
        },
        light: {
          target: 'light',
        },
      },
    },
  },
})
