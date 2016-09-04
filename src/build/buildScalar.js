import { GraphQLScalarType } from 'graphql/type';
import { getDescription } from 'graphql/utilities/buildASTSchema';

export default function buildScalar(scalarAST, config = {}) {
  const {
    serialize,
    parseValue,
    parseLiteral,
    // eslint-disable-next-line no-underscore-dangle
  } = config instanceof GraphQLScalarType ? config._scalarConfig : config;
  const scalarTypeConfig = { name: scalarAST.name.value, serialize, parseValue, parseLiteral };
  const description = getDescription(scalarAST);
  if (description) scalarTypeConfig.description = description;
  return new GraphQLScalarType(scalarTypeConfig);
}
