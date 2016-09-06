/* eslint-env jest */

import resolveThunk from '../resolveThunk';

describe('resolveThunk()', () => {
  it('should work', () => {
    expect(resolveThunk(true)).toBe(true);
    expect(resolveThunk(() => true)).toBe(true);
  });
});
