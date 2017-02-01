import { GraphQLUnionType } from 'graphql/type';
import { getDescription } from 'graphql/utilities/buildASTSchema';
import produceType from './produceType';

export default function buildUnion(unionAST, { resolveType } = {}, types) {
  const unionTypeConfig = {
    name: unionAST.name.value,
    types: unionAST.types.map(typeAST => produceType(typeAST, types)),
    resolveType,
  };
  const description = getDescription(unionAST);
  if (description) unionTypeConfig.description = description;
  return new GraphQLUnionType(unionTypeConfig);
}
