/**
 * AsyncData is a data structure to represents 4 states:
 *
 * - Initial
 * - Loading
 * - Failure
 * - Success
 *
 * Inspired by @effext-rx/Result by @tim-smart
 * @see https://github.com/tim-smart/effect-rx/blob/main/packages/rx/src/Result.ts
 * and
 * @typed/AsyncData by @TylorS
 * @see https://github.com/TylorS/typed/blob/development/packages/async-data/src/AsyncData.ts
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Either as E, Option as O } from 'effect'
import { dual, pipe } from 'effect/Function'

export class Initial<A> {
  readonly _tag = 'Initial'
  constructor(readonly data: O.Option<A>) {}
}

export class Loading<A> {
  readonly _tag = 'Loading'
  constructor(readonly data: O.Option<A>) {}
}

export class Result<E, A> {
  readonly _tag = 'Result'
  constructor(readonly data: E.Either<E, A>) {}
}

export type AsyncData<E, A> = Initial<A> | Loading<A> | Result<E, A>

export const initial = <A>(data: O.Option<A>): Initial<A> => new Initial(data)
export const loading = <A>(data: O.Option<A>): Loading<A> => new Loading(data)
export const fail = <E, _>(error: E): Result<E, never> =>
  new Result(E.left(error))
export const success = <_, A>(data: A): Result<never, A> =>
  new Result(E.right(data))

export const isLoading = <_, A>(data: AsyncData<_, A>): data is Loading<A> => {
  return data._tag === 'Loading'
}

export const isInitial = <_, A>(data: AsyncData<_, A>): data is Initial<A> =>
  data._tag === 'Initial'

export const isFailure = <E, _>(
  data: AsyncData<E, _>
): data is Result<E, never> => data._tag === 'Result' && E.isLeft(data.data)

export const isSuccess = <_, A>(
  data: AsyncData<_, A>
): data is Result<never, A> => data._tag === 'Result' && E.isRight(data.data)

export const value = <E, A>(self: AsyncData<E, A>): O.Option<A> => {
  switch (self._tag) {
    case 'Initial':
    case 'Loading':
      return self.data
    case 'Result':
      return O.getRight(self.data)
  }
}

export const map = dual<
  <A, B>(f: (a: A) => B) => <E>(self: AsyncData<E, A>) => AsyncData<E, B>,
  <E, A, B>(self: AsyncData<E, A>, f: (a: A) => B) => AsyncData<E, B>
>(2, <E, A, B>(self: AsyncData<E, A>, f: (a: A) => B): AsyncData<E, B> => {
  switch (self._tag) {
    case 'Initial':
    case 'Loading':
      return { ...self, data: pipe(self.data, O.map(f)) }
    case 'Result':
      return { ...self, data: pipe(E.map(self.data, f)) }
  }
})

export const foldA: <E, A, T>(
  onPending: (a?: A) => T,
  onLoading: (a?: A) => T,
  onError: (e: E) => T,
  onSuccess: (a: A) => T
) => (self: AsyncData<E, A>) => T =
  (onPending, onLoading, onError, onSuccess) => (self) => {
    switch (self._tag) {
      case 'Initial':
        return pipe(self.data, O.getOrUndefined, onPending)
      case 'Loading':
        return pipe(self.data, O.getOrUndefined, onLoading)
      case 'Result':
        return pipe(self.data, E.match({ onLeft: onError, onRight: onSuccess }))
    }
  }
