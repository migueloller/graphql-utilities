/* @flow */

import type { EnumTypeDefinitionNode } from 'graphql/language';
import { GraphQLEnumType } from 'graphql/type';
import getDeprecationReason from './getDeprecationReason';
import getDescription from './getDescription';

type BuildEnumValueConfigMapConfigMap = {
  [valueName: string]: {
    value?: any;
  };
};

export function buildEnumValueConfigMap(
  node: EnumTypeDefinitionNode,
  configMap?: BuildEnumValueConfigMapConfigMap = {},
) {
  return node.values.reduce((map, valueNode) => ({
    ...map,
    [valueNode.name.value]: {
      ...configMap[valueNode.name.value],
      deprecationReason: getDeprecationReason(valueNode.directives),
      description: getDescription(valueNode),
    },
  }), {});
}

type BuildEnumConfig = {
  values?: BuildEnumValueConfigMapConfigMap;
};

export default function buildEnum(node: EnumTypeDefinitionNode, config?: BuildEnumConfig = {}) {
  const { values, ...rest } = config;
  return new GraphQLEnumType({
    ...rest,
    name: node.name.value,
    values: buildEnumValueConfigMap(node, values),
    description: getDescription(node),
  });
}
