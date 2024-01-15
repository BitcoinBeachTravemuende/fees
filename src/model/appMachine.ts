import { createMachine } from 'xstate'

export const toggleMachine = createMachine({
  id: 'toggle',
  types: {} as {
    events: { type: 'TOGGLE' }
  },
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active' },
    },
    active: {
      on: { TOGGLE: 'inactive' },
    },
  },
})
