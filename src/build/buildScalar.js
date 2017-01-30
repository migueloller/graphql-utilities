/* @flow */

import type { ValueNode, ScalarTypeDefinitionNode } from 'graphql/language';
import { GraphQLScalarType } from 'graphql/type';
import getDescription from './getDescription';

type PartialConfig<TInternal, TExternal> = {
  serialize: (value: mixed) => ?TExternal;
  parseValue?: (value: mixed) => ?TInternal;
  parseLiteral?: (valueNode: ValueNode) => ?TInternal;
};

type BuildScalarConfig = PartialConfig<*, *> | GraphQLScalarType;

export default function buildScalar(node: ScalarTypeDefinitionNode, config: BuildScalarConfig) {
  return new GraphQLScalarType({
    // eslint-disable-next-line no-underscore-dangle
    ...(config instanceof GraphQLScalarType ? config._scalarConfig : config),
    name: node.name.value,
    description: getDescription(node),
  });
}
