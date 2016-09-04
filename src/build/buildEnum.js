import { GraphQLEnumType } from 'graphql/type';
import { getDescription } from 'graphql/utilities/buildASTSchema';

export const buildEnumValueConfigMap = (enumAST, configMap = {}) =>
  enumAST.values.reduce((map, enumValueAST) => {
    const name = enumValueAST.name.value;
    const config = configMap[name] || {};
    // set enum value to it's name by default
    const value = 'value' in config ? config.value : name;
    const description = getDescription(enumValueAST);
    const enumValueConfig = { value };
    if ('deprecationReason' in config) enumValueConfig.deprecationReason = config.deprecationReason;
    if (description) enumValueConfig.description = description;
    return { ...map, [name]: enumValueConfig };
  }, {});

export default function buildEnum(enumAST, { values } = {}) {
  const enumTypeConfig = {
    name: enumAST.name.value,
    values: buildEnumValueConfigMap(enumAST, values),
  };
  const description = getDescription(enumAST);
  if (description) enumTypeConfig.description = description;
  return new GraphQLEnumType(enumTypeConfig);
}
