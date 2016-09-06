export default function resolveThunk(thunk) {
  return typeof thunk === 'function' ? thunk() : thunk;
}
