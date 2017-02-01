/* @flow */

import { parse } from 'graphql/language';
import getDescription from '../getDescription';

describe('getDescription()', () => {
  const generateNode = description => parse(`
    # ${description === undefined ? '' : description}
    type Type {
      int: Int
    }
  `).definitions[0];

  test('gets description', () => {
    const description = 'A description.';
    expect(getDescription(generateNode(description))).toBe(description);
  });

  test('returns undefined if there\'s no description', () => {
    expect(getDescription(generateNode())).toBeUndefined();
  });

  test('return undefined if there\'s an empty description', () => {
    expect(getDescription(generateNode(' '))).toBeUndefined();
  });
});
