import { GraphQLObjectType } from 'graphql/type';
import { getDescription } from 'graphql/utilities/buildASTSchema';
import produceType from './produceType';
import buildFieldConfigMap from './buildFieldConfigMap';
import resolveShortcut from './resolveShortcut';

export default function buildObject(objectAST, config = {}, types) {
  const objectTypeConfig = { name: objectAST.name.value };
  const interfaces = objectAST.interfaces;
  const description = getDescription(objectAST);
  if (interfaces.length) {
    objectTypeConfig.interfaces = () => interfaces.map(typeAST => produceType(typeAST, types));
  }
  if (!('fields' in config) && !('isTypeOf' in config)) {
    // `resolve` shortcut
    objectTypeConfig.fields = () => buildFieldConfigMap(objectAST, resolveShortcut(config), types);
  } else {
    objectTypeConfig.fields = () => buildFieldConfigMap(objectAST, config.fields, types);
    objectTypeConfig.isTypeOf = config.isTypeOf;
  }
  if (description) objectTypeConfig.description = description;
  return new GraphQLObjectType(objectTypeConfig);
}
