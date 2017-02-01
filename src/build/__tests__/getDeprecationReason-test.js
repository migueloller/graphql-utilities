/* @flow */

import { parse } from 'graphql/language';
import getDeprecationReason from '../getDeprecationReason';

describe('getDeprecationReason()', () => {
  const generateNode = reason => (parse(`
    type Type {
      deprecatedInt: Int ${reason === undefined ? '' : `@deprecated(reason: "${reason}")`}
    }
  `).definitions[0]: Object).fields[0].directives;

  test('gets deprecation reason', () => {
    const reason = 'A reason.';
    expect(getDeprecationReason(generateNode(reason))).toBe(reason);
  });

  test('returns undefined if there\'s no deprecation reason', () => {
    expect(getDeprecationReason(generateNode())).toBeUndefined();
  });
});
