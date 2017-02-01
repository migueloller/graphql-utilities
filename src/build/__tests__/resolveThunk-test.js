/* @flow */

import resolveThunk from '../resolveThunk';

describe('resolveThunk()', () => {
  test('works', () => {
    expect(resolveThunk(true)).toBe(true);
    expect(resolveThunk(() => true)).toBe(true);
  });
});
