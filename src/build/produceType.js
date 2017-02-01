/* @flow */

import {
  type GraphQLType,
  type GraphQLNamedType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  __Schema,
  __Directive,
  __DirectiveLocation,
  __Type,
  __Field,
  __InputValue,
  __EnumValue,
  __TypeKind,
} from 'graphql/type';
import { type TypeNode, type NamedTypeNode, Kind } from 'graphql/language';
import invariant from './invariant';
import resolveThunk, { type Thunk } from './resolveThunk';

const { LIST_TYPE, NON_NULL_TYPE } = Kind;

/**
 * Mirror of [innerTypeMap]{@link https://github.com/graphql/graphql-js/blob/master/src/utilities/buildASTSchema.js#L228}.
 */
const innerTypeMap = {
  Int: GraphQLInt,
  Float: GraphQLFloat,
  String: GraphQLString,
  Boolean: GraphQLBoolean,
  ID: GraphQLID,
  __Schema,
  __Directive,
  __DirectiveLocation,
  __Type,
  __Field,
  __InputValue,
  __EnumValue,
  __TypeKind,
};

/**
 * Retrieves the wrapped type AST given a wrapper type (GraphQLNonNull or GraphQLList) AST.
 *
 * Mirror of [getNamedTypeNode]{@link https://github.com/graphql/graphql-js/blob/master/src/utilities/buildASTSchema.js#L120}.
 */
export function getNamedTypeNode(typeNode: TypeNode): NamedTypeNode {
  let namedType = typeNode;
  while (namedType.kind === LIST_TYPE || namedType.kind === NON_NULL_TYPE) {
    namedType = namedType.type;
  }
  return namedType;
}

/**
 * Builds a GraphQL wrapper type (GraphQLNonNull or GraphQLList) given the type to wrap and the AST
 * of the wrapper type.
 *
 * Mirror of [buildWrappedType]{@link https://github.com/graphql/graphql-js/blob/master/src/utilities/buildASTSchema.js#L105}.
 */
export function buildWrappedType(innerType: GraphQLType, inputTypeNode: TypeNode): GraphQLType {
  if (inputTypeNode.kind === LIST_TYPE) {
    return new GraphQLList(buildWrappedType(innerType, inputTypeNode.type));
  }
  if (inputTypeNode.kind === NON_NULL_TYPE) {
    const wrappedType = buildWrappedType(innerType, inputTypeNode.type);
    invariant(!(wrappedType instanceof GraphQLNonNull), 'No nesting nonnull.');
    return new GraphQLNonNull(wrappedType);
  }
  return innerType;
}

export type TypeDependencies = Thunk<Array<GraphQLNamedType>>;

/**
 * Retrieves or builds a GraphQLType given the type AST and a thunk of GraphQLNamedType
 * dependencies.
 */
export default function produceType(typeNode: TypeNode, types: TypeDependencies): GraphQLType {
  const typeName = getNamedTypeNode(typeNode).name.value;

  if (innerTypeMap[typeName]) return buildWrappedType(innerTypeMap[typeName], typeNode);

  const type = resolveThunk(types).find(({ name }) => name === typeName);

  invariant(type, `Type "${typeName}" not found.`);

  return buildWrappedType(type, typeNode);
}
