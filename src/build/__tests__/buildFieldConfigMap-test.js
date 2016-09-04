/* eslint-env jest */

import { GraphQLInt } from 'graphql/type';
import { parse } from 'graphql/language';
import buildFieldConfigMap, { buildFieldConfigArgumentMap } from '../buildFieldConfigMap';

const generateTypeAST = ({
  name = 'Object',
  fields = { field: 'Int' },
} = {}) => parse(`
  type ${name} {
    ${Object.entries(fields).map((entry) => entry.join(': ')).join('\n')}
  }
`).definitions[0];

describe('buildFieldConfigArgumentMap()', () => {
  const generateArgumentFieldAST = ({
    name = 'field',
    args = { argument: 'Int' },
  } = {}) => generateTypeAST({
    fields: {
      [`
        ${name}(
          ${Object.entries(args).map((entry) => entry.join(': ')).join('\n')}
        )
      `]: 'Int',
    },
  }).fields[0];
  const generateFieldConfigMap = ({
    name = 'argument',
    type = GraphQLInt,
    defaultValue,
    description,
  } = {}) => ({ [name]: { type, defaultValue, description } });

  it('should work with minimal AST', () => {
    expect(buildFieldConfigArgumentMap(generateArgumentFieldAST()))
      .toEqual(generateFieldConfigMap());
  });

  it('should work with description in AST', () => {
    const description = 'A description.';
    expect(buildFieldConfigArgumentMap(generateArgumentFieldAST({
      args: { [`# ${description}\nargument`]: 'Int' },
    }))).toEqual(generateFieldConfigMap({ description }));
  });

  it('should work with default value in AST', () => {
    expect(buildFieldConfigArgumentMap(generateArgumentFieldAST({
      args: { argument: 'Int = 0' },
    }))).toEqual(generateFieldConfigMap({ defaultValue: 0 }));
  });
});

describe('buildFieldConfigMap()', () => {
  const generateFieldConfigMap = ({
    name = 'field',
    type = GraphQLInt,
    args,
    resolve,
    deprecationReason,
    description,
  } = {}) => ({ [name]: { type, args, resolve, deprecationReason, description } });
  it('should work with minimal AST', () => {
    expect(buildFieldConfigMap(generateTypeAST())).toEqual(generateFieldConfigMap());
  });

  it('should work with description in AST', () => {
    const description = 'A description.';
    expect(buildFieldConfigMap(generateTypeAST({
      fields: { [`# ${description}\nfield`]: 'Int' },
    }))).toEqual(generateFieldConfigMap({ description }));
  });

  it('should work with arguments in AST', () => {
    expect(buildFieldConfigMap(generateTypeAST({
      fields: { 'field(argument: Int)': 'Int' },
    }))).toEqual(generateFieldConfigMap({ args: { argument: { type: GraphQLInt } } }));
  });

  it('should work with arguments in AST and `args` in config map', () => {
    const args = { argument: { type: GraphQLInt } };
    expect(buildFieldConfigMap(generateTypeAST({
      fields: { 'field(argument: Int)': 'Int' },
    }), { field: args })).toEqual(generateFieldConfigMap({ args }));
  });

  it('should work with `resolve` in config map', () => {
    const resolve = () => {};
    expect(buildFieldConfigMap(generateTypeAST(), { field: { resolve } }))
      .toEqual(generateFieldConfigMap({ resolve }));
  });

  it('should work with `deprecationReason` in config map', () => {
    const deprecationReason = 'A reason.';
    expect(buildFieldConfigMap(generateTypeAST(), { field: { deprecationReason } }))
      .toEqual(generateFieldConfigMap({ deprecationReason }));
  });
});
