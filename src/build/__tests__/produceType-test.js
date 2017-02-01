/* @flow */

import { parse } from 'graphql/language';
import {
  GraphQLScalarType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  __Schema,
  __Directive,
  __DirectiveLocation,
  __Type,
  __Field,
  __InputValue,
  __EnumValue,
  __TypeKind,
} from 'graphql/type';
import produceType, { getNamedTypeNode, buildWrappedType } from '../produceType';

const [{ type: wrappedTypeNode }, { type: wrapperTypeNode }] = (parse(`
  type Ints {
    int: Int
    nonNullListOfNonNullInt: [Int!]!
  }
`, { noLocation: true }).definitions[0]: Object).fields;
const wrappedType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLInt)));

describe('getNamedTypeNode()', () => {
  test('gets wrapped type nodes', () => {
    expect(getNamedTypeNode(wrapperTypeNode)).toEqual(wrappedTypeNode);
  });
});

describe('buildWrappedType()', () => {
  test('wraps types', () => {
    expect(buildWrappedType(GraphQLInt, wrapperTypeNode)).toEqual(wrappedType);
  });
});

describe('produceType()', () => {
  const customTypeNode: Object = parse(`
    scalar UUID
  `).definitions[0];
  const UUID = new GraphQLScalarType({ name: 'UUID', serialize: String });

  test('produces GraphQL inner types', () => {
    const typeNode: Object = parse(`
      type InnerTypes {
        int: Int
        float: Float
        string: String
        boolean: Boolean
        id: ID
        schema: __Schema,
        directive: __Directive,
        directiveLocation: __DirectiveLocation,
        type: __Type,
        field: __Field,
        inputValue: __InputValue,
        enumValue: __EnumValue,
        typeKind: __TypeKind,
      }
    `).definitions[0];
    expect(typeNode.fields.map(({ type }) => type).map(produceType)).toEqual([
      GraphQLInt,
      GraphQLFloat,
      GraphQLString,
      GraphQLBoolean,
      GraphQLID,
      __Schema,
      __Directive,
      __DirectiveLocation,
      __Type,
      __Field,
      __InputValue,
      __EnumValue,
      __TypeKind,
    ]);
  });

  test('produces GraphQL type wrappers', () => {
    expect(produceType(wrapperTypeNode, [])).toEqual(wrappedType);
  });

  test('produces custom types', () => {
    expect(produceType(customTypeNode, [UUID])).toEqual(UUID);
  });

  test('throws if it can\'t produce the type', () => {
    expect(() => produceType(customTypeNode, []))
      .toThrowError('Type "UUID" not found.');
  });
});
