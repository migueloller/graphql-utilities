import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql/type';
import { Kind } from 'graphql/language';

const { LIST_TYPE, NON_NULL_TYPE } = Kind;

const scalarTypeMap = {
  Int: GraphQLInt,
  Float: GraphQLFloat,
  String: GraphQLString,
  Boolean: GraphQLBoolean,
  ID: GraphQLID,
};

export const getNamedTypeAST = (typeAST) => {
  let namedTypeAST = typeAST;
  while (namedTypeAST.kind === LIST_TYPE || namedTypeAST.kind === NON_NULL_TYPE) {
    namedTypeAST = namedTypeAST.type;
  }
  return namedTypeAST;
};

export const buildWrappedType = (innerType, typeAST) => {
  if (typeAST.kind === LIST_TYPE) {
    return new GraphQLList(buildWrappedType(innerType, typeAST.type));
  }
  if (typeAST.kind === NON_NULL_TYPE) {
    return new GraphQLNonNull(buildWrappedType(innerType, typeAST.type));
  }
  return innerType;
};

export const resolveThunk = (thunk) => (typeof thunk === 'function' ? thunk() : thunk);

export default function produceType(typeAST, types) {
  const namedTypeAST = getNamedTypeAST(typeAST);
  const typeName = namedTypeAST.name.value;
  if (scalarTypeMap[typeName]) return buildWrappedType(scalarTypeMap[typeName], typeAST);
  const maybeType = resolveThunk(types).find(({ name }) => name === typeName);
  if (maybeType) return buildWrappedType(maybeType, typeAST);
  throw new Error(`Type "${typeName}" not found.`);
}
