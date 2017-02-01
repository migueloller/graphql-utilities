/* @flow */

import invariant from '../invariant';

describe('invariant()', () => {
  test('works', () => {
    invariant(true, '...');
    expect(() => invariant(false, 'Boom!')).toThrowError('Boom!');
  });
});
