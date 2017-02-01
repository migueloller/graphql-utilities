/* @flow */

import { type GraphQLScalarTypeConfig, GraphQLScalarType } from 'graphql/type';
import { parse } from 'graphql/language';
import buildScalar from '../buildScalar';

describe('buildScalar()', () => {
  const generateScalarNode = ({
    description,
    name = 'Scalar',
  }: { description: string, name?: string } = {}): Object => parse(`
    # ${description === undefined ? '' : description}
    scalar ${name}
  `).definitions[0];
  const generateScalarType = ({
    name = 'Scalar',
    description,
    serialize,
    parseValue,
    parseLiteral,
  }: $Shape<GraphQLScalarTypeConfig<*, *>> = {}) => new GraphQLScalarType({
    name,
    description,
    serialize,
    parseValue,
    parseLiteral,
  });

  test('throws with without `serialize` in config', () => {
    expect(() => buildScalar(generateScalarNode(), ({}: Object))).toThrow();
  });

  test('builds with `serialize` in config', () => {
    const config = { serialize() {} };
    expect(buildScalar(generateScalarNode(), config)).toEqual(generateScalarType(config));
  });

  test('builds with `serialize` in config and description in AST', () => {
    const config = { description: 'A description', serialize() {} };
    expect(buildScalar(generateScalarNode(config), config)).toEqual(generateScalarType(config));
  });

  test('builds with `serialize`, `parseValue`, and `parseLiteral` in config', () => {
    const config = { serialize() {}, parseValue() {}, parseLiteral() {} };
    expect(buildScalar(generateScalarNode(), config)).toEqual(generateScalarType(config));
  });

  test('builds with GraphQLScalarType', () => {
    const config = { serialize() {} };
    expect(buildScalar(generateScalarNode(), generateScalarType(config)))
      .toEqual(generateScalarType(config));
  });
});
