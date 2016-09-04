/* eslint-env jest */

import { GraphQLObjectType, GraphQLInterfaceType, GraphQLInt } from 'graphql/type';
import { parse } from 'graphql/language';
import { expectTypesEqual } from './comparators';
import buildObject from '../buildObject';

describe('buildObject()', () => {
  const generateObjectAST = ({
    description,
    name = 'Object',
    interfaces = [],
    fields = { field: 'Int' },
  } = {}) => parse(`
    # ${description === undefined ? '' : description}
    type ${name} ${interfaces.length ? `implements ${interfaces.join(', ')}` : ''} {
      ${Object.entries(fields).map((entry) => entry.join(': ')).join('\n')}
    }
  `).definitions[0];
  const generateObjectType = ({
    name = 'Object',
    interfaces,
    fields = { field: { type: GraphQLInt } },
    isTypeOf,
    description,
  } = {}) => new GraphQLObjectType({ name, interfaces, fields, isTypeOf, description });

  it('should work with minimal AST', () => {
    expectTypesEqual(buildObject(generateObjectAST()), generateObjectType());
  });

  it('should work with description in AST', () => {
    const config = { description: 'A description.' };
    expectTypesEqual(buildObject(generateObjectAST(config)), generateObjectType(config));
  });

  it('should work with interfaces in AST', () => {
    const Interface = new GraphQLInterfaceType({ name: 'Interface', resolveType() {} });
    expectTypesEqual(
      buildObject(generateObjectAST({ interfaces: ['Interface'] }), undefined, [Interface]),
      generateObjectType({ interfaces: [Interface] }),
    );
  });

  it('should work with `resolve` shortcut', () => {
    const resolve = () => {};
    expectTypesEqual(
      buildObject(generateObjectAST(), { field: resolve }),
      generateObjectType({ fields: { field: { type: GraphQLInt, resolve } } }),
    );
  });

  it('should work with `fields` in config', () => {
    const deprecationReason = 'A reason.';
    expectTypesEqual(
      buildObject(generateObjectAST(), { fields: { field: { deprecationReason } } }),
      generateObjectType({ fields: { field: { type: GraphQLInt, deprecationReason } } }),
    );
  });

  it('should work with `isTypeOf` in config', () => {
    const config = { isTypeOf() {} };
    expectTypesEqual(buildObject(generateObjectAST(), config), generateObjectType(config));
  });
});
