/* @flow */

export type Thunk<T> = (() => T) | T;

export default function resolveThunk<T>(thunk: Thunk<T>): T {
  return typeof thunk === 'function' ? thunk() : thunk;
}
