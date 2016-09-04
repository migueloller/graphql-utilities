/* eslint-env jest */

import { GraphQLEnumType } from 'graphql/type';
import { parse } from 'graphql/language';
import buildEnum, { buildEnumValueConfigMap } from '../buildEnum';

const generateEnumAST = ({ description, name = 'Enum', values = ['VALUE'] } = {}) => parse(`
  # ${description === undefined ? '' : description}
  enum ${name} {
    ${values.join('\n')}
  }
`).definitions[0];
const generateEnumValueConfigMap = ({
  name = 'VALUE',
  value = 'VALUE',
  description,
  deprecationReason,
} = {}) => ({ [name]: { value, description, deprecationReason } });

describe('buildEnumValueConfigMap()', () => {
  it('should work with minimal AST', () => {
    expect(buildEnumValueConfigMap(generateEnumAST())).toEqual(generateEnumValueConfigMap());
  });

  it('should work with description in AST', () => {
    const description = 'Another description.';
    expect(buildEnumValueConfigMap(generateEnumAST({
      values: [`# ${description}\nVALUE`],
    }))).toEqual(generateEnumValueConfigMap({ description }));
  });

  it('should work with `value` in config map', () => {
    const value = 'value';
    expect(buildEnumValueConfigMap(generateEnumAST(), { VALUE: { value } }))
      .toEqual(generateEnumValueConfigMap({ value }));
  });

  it('should work with `deprecationReason` in config map', () => {
    const deprecationReason = 'A reason.';
    expect(buildEnumValueConfigMap(generateEnumAST(), { VALUE: { deprecationReason } }))
      .toEqual(generateEnumValueConfigMap({ deprecationReason }));
  });
});

describe('buildEnum()', () => {
  const generateEnumType = ({
    name = 'Enum',
    values = generateEnumValueConfigMap(),
    description,
  } = {}) => new GraphQLEnumType({ name, values, description });

  it('should work with minimal AST', () => {
    expect(buildEnum(generateEnumAST())).toEqual(generateEnumType());
  });

  it('should work with description in AST', () => {
    const config = { description: 'A description.' };
    expect(buildEnum(generateEnumAST(config))).toEqual(generateEnumType(config));
  });

  it('should work with `values` in config', () => {
    const config = { values: { VALUE: { value: 'value' } } };
    expect(buildEnum(generateEnumAST(), config)).toEqual(generateEnumType(config));
  });
});
