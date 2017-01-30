import { GraphQLScalarType } from 'graphql/type';
import { parse } from 'graphql/language';
import buildScalar from '../buildScalar';

describe('buildScalar()', () => {
  const generateScalarAST = ({ description, name = 'Scalar' } = {}) => parse(`
    # ${description === undefined ? '' : description}
    scalar ${name}
  `).definitions[0];
  const generateScalarType = ({
    name = 'Scalar',
    description,
    serialize,
    parseValue,
    parseLiteral,
  } = {}) => new GraphQLScalarType({ name, description, serialize, parseValue, parseLiteral });

  it('should throw with without `serialize` in config', () => {
    expect(() => buildScalar(generateScalarAST())).toThrow();
  });

  it('should work with `serialize` in config', () => {
    const config = { serialize() {} };
    expect(buildScalar(generateScalarAST(), config)).toEqual(generateScalarType(config));
  });

  it('should work with `serialize` in config and description in AST', () => {
    const config = { description: 'A description', serialize() {} };
    expect(buildScalar(generateScalarAST(config), config)).toEqual(generateScalarType(config));
  });

  it('should work with `serialize`, `parseValue`, and `parseLiteral` in config', () => {
    const config = { serialize() {}, parseValue() {}, parseLiteral() {} };
    expect(buildScalar(generateScalarAST(), config)).toEqual(generateScalarType(config));
  });

  it('should work with GraphQL scalar type', () => {
    const config = { serialize() {} };
    expect(buildScalar(generateScalarAST(), generateScalarType(config)))
      .toEqual(generateScalarType(config));
  });
});
