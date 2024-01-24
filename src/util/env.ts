import { isNonEmpty, isString } from 'effect/String'

export const envStringWithDefault = (
  env: string,
  defaultValue: string
): string => (isString(env) && isNonEmpty(env) ? env : defaultValue)
