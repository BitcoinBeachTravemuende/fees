import { expect, test } from 'vitest'
import { isEndpoint } from './types'

test('isEndpoint', () => {
  // true
  expect(isEndpoint('mempool')).toBe(true)
  expect(isEndpoint('esplora')).toBe(true)
  // false
  expect(isEndpoint('')).toBe(false)
  expect(isEndpoint('unknown')).toBe(false)
})
