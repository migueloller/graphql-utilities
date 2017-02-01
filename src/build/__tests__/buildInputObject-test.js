import { GraphQLInputObjectType, GraphQLInt } from 'graphql/type';
import { parse } from 'graphql/language';
import { expectTypesEqual } from './comparators';
import buildInputObject, { buildInputObjectConfigFieldMap } from '../buildInputObject';

const generateInputObjectAST = ({
  description,
  name = 'Object',
  fields = { field: 'Int' },
} = {}) => parse(`
  # ${description === undefined ? '' : description}
  input ${name} {
    ${Object.entries(fields).map(entry => entry.join(': ')).join('\n')}
  }
`).definitions[0];

describe('buildInputObjectConfigFieldMap()', () => {
  const generateInputObjectConfigFieldMap = ({
    name = 'field',
    type = GraphQLInt,
    defaultValue,
    description,
  } = {}) => ({ [name]: { type, defaultValue, description } });

  it('should work with minimal AST', () => {
    expect(buildInputObjectConfigFieldMap(generateInputObjectAST()))
      .toEqual(generateInputObjectConfigFieldMap());
  });

  it('should work with description in AST', () => {
    const description = 'A description.';
    expect(buildInputObjectConfigFieldMap(generateInputObjectAST({
      fields: { [`# ${description}\nfield`]: 'Int' },
    }))).toEqual(generateInputObjectConfigFieldMap({ description }));
  });

  it('should work with default value in AST', () => {
    expect(buildInputObjectConfigFieldMap(generateInputObjectAST({
      fields: { field: 'Int = 0' },
    }))).toEqual(generateInputObjectConfigFieldMap({ defaultValue: 0 }));
  });
});

describe('buildInputObject()', () => {
  const generateInputObjectType = ({
    name = 'Object',
    fields = { field: { type: GraphQLInt } },
    description,
  } = {}) => new GraphQLInputObjectType({ name, fields, description });

  it('should work with minimal AST', () => {
    expectTypesEqual(buildInputObject(generateInputObjectAST()), generateInputObjectType());
  });

  it('should work with description in AST', () => {
    const config = { description: 'A description.' };
    expectTypesEqual(
      buildInputObject(generateInputObjectAST(config)),
      generateInputObjectType(config),
    );
  });
});
