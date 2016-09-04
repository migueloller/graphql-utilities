/* eslint-env jest */

import { GraphQLInterfaceType, GraphQLInt } from 'graphql/type';
import { parse } from 'graphql/language';
import { expectTypesEqual } from './comparators';
import buildInterface from '../buildInterface';

describe('buildInterface()', () => {
  const generateInterfaceAST = ({
    description,
    name = 'Interface',
    fields = { field: 'Int' },
  } = {}) => parse(`
    # ${description === undefined ? '' : description}
    interface ${name} {
      ${Object.entries(fields).map((entry) => entry.join(': ')).join('\n')}
    }
  `).definitions[0];
  const generateInterfaceType = ({
    name = 'Interface',
    fields = { field: { type: GraphQLInt } },
    resolveType,
    description,
  } = {}) => new GraphQLInterfaceType({ name, fields, resolveType, description });

  it('should work with minimal AST', () => {
    expectTypesEqual(buildInterface(generateInterfaceAST()), generateInterfaceType());
  });

  it('should work with description in AST', () => {
    const config = { description: 'A description.' };
    expectTypesEqual(buildInterface(generateInterfaceAST(config)), generateInterfaceType(config));
  });

  it('should work with `resolve` shortcut', () => {
    const resolve = () => {};
    expectTypesEqual(
      buildInterface(generateInterfaceAST(), { field: resolve }),
      generateInterfaceType({ fields: { field: { type: GraphQLInt, resolve } } }),
    );
  });

  it('should work with `fields` in config', () => {
    const deprecationReason = 'A reason.';
    expectTypesEqual(
      buildInterface(generateInterfaceAST(), { fields: { field: { deprecationReason } } }),
      generateInterfaceType({ fields: { field: { type: GraphQLInt, deprecationReason } } }),
    );
  });

  it('should work with `resolveType` in config', () => {
    const config = { resolveType() {} };
    expectTypesEqual(buildInterface(generateInterfaceAST(), config), generateInterfaceType(config));
  });
});
