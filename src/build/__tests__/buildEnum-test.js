import { GraphQLEnumType } from 'graphql/type';
import { parse } from 'graphql/language';
import buildEnum, { buildEnumValueConfigMap } from '../buildEnum';

const generateEnumNode = ({ description, name = 'Enum', values = ['VALUE'] } = {}) => parse(`
  # ${description === undefined ? '' : description}
  enum ${name} {
    ${values.join('\n')}
  }
`).definitions[0];
const generateEnumValueConfigMap = ({
  name = 'VALUE',
  value,
  deprecationReason,
  description,
} = {}) => (name ? ({ [name]: { value, deprecationReason, description } }) : {});

describe('buildEnumValueConfigMap()', () => {
  it('builds with minimal AST', () => {
    expect(buildEnumValueConfigMap(generateEnumNode())).toEqual(generateEnumValueConfigMap());
  });

  it('builds with description in AST', () => {
    const description = 'Another description.';
    expect(buildEnumValueConfigMap(generateEnumNode({
      values: [`# ${description}\nVALUE`],
    }))).toEqual(generateEnumValueConfigMap({ description }));
  });

  it('builds with deprecation directive in AST', () => {
    const deprecationReason = 'A reason.';
    expect(buildEnumValueConfigMap(generateEnumNode({
      values: [`VALUE @deprecated(reason: "${deprecationReason}")`],
    }))).toEqual(generateEnumValueConfigMap({ deprecationReason }));
  });

  it('builds with `value` in config map', () => {
    const value = 'value';
    expect(buildEnumValueConfigMap(generateEnumNode(), { VALUE: { value } }))
      .toEqual(generateEnumValueConfigMap({ value }));
  });
});

describe('buildEnum()', () => {
  const generateEnumType = ({
    name = 'Enum',
    values = generateEnumValueConfigMap(),
    description,
  } = {}) => new GraphQLEnumType({ name, values, description });

  it('builds with minimal AST', () => {
    expect(buildEnum(generateEnumNode())).toEqual(generateEnumType());
  });

  it('builds with description in AST', () => {
    const config = { description: 'A description.' };
    expect(buildEnum(generateEnumNode(config))).toEqual(generateEnumType(config));
  });

  it('builds with `values` in config', () => {
    const config = { values: { VALUE: { value: 'value' } } };
    expect(buildEnum(generateEnumNode(), config)).toEqual(generateEnumType(config));
  });
});
