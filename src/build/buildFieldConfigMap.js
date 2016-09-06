import { getDescription } from 'graphql/utilities/buildASTSchema';
import { getNamedType } from 'graphql/type';
import produceType from './produceType';

export const buildFieldConfigArgumentMap = (fieldAST, types) =>
  fieldAST.arguments.reduce((map, inputValueAST) => {
    const type = produceType(inputValueAST.type, types);
    const defaultValue = inputValueAST.defaultValue;
    const description = getDescription(inputValueAST);
    const argumentConfig = { type };
    if (defaultValue !== null) {
      argumentConfig.defaultValue = getNamedType(type).parseLiteral(defaultValue);
    }
    if (description) argumentConfig.description = description;
    return { ...map, [inputValueAST.name.value]: argumentConfig };
  }, {});

export default function buildFieldConfigMap(objectAST, configMap = {}, types) {
  return objectAST.fields.reduce((map, fieldAST) => {
    const name = fieldAST.name.value;
    const config = configMap[name] || {};
    const type = produceType(fieldAST.type, types);
    const args = buildFieldConfigArgumentMap(fieldAST, types);
    const description = getDescription(fieldAST);
    const fieldConfig = { type };
    if (Object.keys(args).length) fieldConfig.args = args;
    if ('resolve' in config) fieldConfig.resolve = config.resolve;
    if ('deprecationReason' in config) fieldConfig.deprecationReason = config.deprecationReason;
    if (description) fieldConfig.description = description;
    return { ...map, [name]: fieldConfig };
  }, {});
}
