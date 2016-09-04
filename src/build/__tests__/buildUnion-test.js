/* eslint-env jest */

import {
  GraphQLUnionType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql/type';
import { parse } from 'graphql/language';
import buildUnion from '../buildUnion';

describe('buildUnion()', () => {
  const generateUnionAST = ({
    description,
    name = 'Union',
    types = 'Int | Float| String | Boolean | ID',
  } = {}) => parse(`
    # ${description === undefined ? '' : description}
    union ${name} = ${types}
  `).definitions[0];
  const generateUnionType = ({
    name = 'Union',
    types = [GraphQLInt, GraphQLFloat, GraphQLString, GraphQLBoolean, GraphQLID],
    resolveType,
    description,
  } = {}) => new GraphQLUnionType({ name, types, resolveType, description });

  it('should work with minimal AST', () => {
    expect(buildUnion(generateUnionAST())).toEqual(generateUnionType());
  });

  it('should work with description in AST', () => {
    const config = { description: 'A description' };
    expect(buildUnion(generateUnionAST(config))).toEqual(generateUnionType(config));
  });

  it('should work with `resolveType` in config', () => {
    const config = { resolveType() {} };
    expect(buildUnion(generateUnionAST(), config)).toEqual(generateUnionType(config));
  });
});
