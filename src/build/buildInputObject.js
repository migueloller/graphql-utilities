import { GraphQLInputObjectType, getNamedType } from 'graphql/type';
import { getDescription } from 'graphql/utilities/buildASTSchema';
import produceType from './produceType';

export const buildInputObjectConfigFieldMap = (inputObjectAST, types) =>
  inputObjectAST.fields.reduce((map, inputValueAST) => {
    const name = inputValueAST.name.value;
    const type = produceType(inputValueAST.type, types);
    const defaultValue = inputValueAST.defaultValue;
    const description = getDescription(inputValueAST);
    const inputObjectFieldConfig = { type };
    if (defaultValue !== null) {
      inputObjectFieldConfig.defaultValue = getNamedType(type).parseLiteral(defaultValue);
    }
    if (description) inputObjectFieldConfig.description = description;
    return { ...map, [name]: inputObjectFieldConfig };
  }, {});

export default function buildInputObject(inputObjectAST, _, types) {
  const inputObjectTypeConfig = {
    name: inputObjectAST.name.value,
    fields: () => buildInputObjectConfigFieldMap(inputObjectAST, types),
  };
  const description = getDescription(inputObjectAST);
  if (description) inputObjectTypeConfig.description = description;
  return new GraphQLInputObjectType(inputObjectTypeConfig);
}
