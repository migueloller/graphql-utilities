import { GraphQLInterfaceType } from 'graphql/type';
import { getDescription } from 'graphql/utilities/buildASTSchema';
import buildFieldConfigMap from './buildFieldConfigMap';
import resolveShortcut from './resolveShortcut';

export default function buildInterface(interfaceAST, config = {}, types) {
  const interfaceTypeConfig = { name: interfaceAST.name.value };
  const description = getDescription(interfaceAST);
  if (!('fields' in config) && !('resolveType' in config)) {
    // `resolve` shortcut
    interfaceTypeConfig.fields = () =>
      buildFieldConfigMap(interfaceAST, resolveShortcut(config), types);
  } else {
    interfaceTypeConfig.fields = () => buildFieldConfigMap(interfaceAST, config.fields, types);
    interfaceTypeConfig.resolveType = config.resolveType;
  }
  if (description) interfaceTypeConfig.description = description;
  return new GraphQLInterfaceType(interfaceTypeConfig);
}
