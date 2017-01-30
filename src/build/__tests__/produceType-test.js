
import {
  GraphQLScalarType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql/type';
import { parse } from 'graphql/language';
import produceType, { getNamedTypeAST, buildWrappedType } from '../produceType';

const [{ type: innerTypeAST }, { type: wrappedTypeAST }] = parse(`
  type Ints {
    int: Int
    nonNullListOfNonNullInt: [Int!]!
  }
`, { noLocation: true }).definitions[0].fields;
const wrappedType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLInt)));

describe('getNamedTypeAST()', () => {
  it('should work', () => {
    expect(getNamedTypeAST(wrappedTypeAST)).toEqual(innerTypeAST);
  });
});

describe('buildWrappedType()', () => {
  it('should work', () => {
    expect(buildWrappedType(GraphQLInt, wrappedTypeAST)).toEqual(wrappedType);
  });
});

describe('produceType()', () => {
  const customTypeAST = parse(`
    scalar UUID
  `).definitions[0];
  const UUID = new GraphQLScalarType({ name: 'UUID', serialize: String });

  it('should produce GraphQL scalars', () => {
    const typeAST = parse(`
      type Scalars {
        int: Int
        float: Float
        string: String
        boolean: Boolean
        id: ID
      }
    `).definitions[0];
    expect(typeAST.fields.map(({ type }) => type).map(produceType))
      .toEqual([GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean, GraphQLID]);
  });

  it('should produce GraphQL type wrappers', () => {
    expect(produceType(wrappedTypeAST, [])).toEqual(wrappedType);
  });

  it('should produce custom types', () => {
    expect(produceType(customTypeAST, [UUID])).toEqual(UUID);
  });

  it('should throw if it can\'t produce the type', () => {
    expect(() => produceType(customTypeAST, []))
      .toThrowError('Type "UUID" not found.');
  });
});
