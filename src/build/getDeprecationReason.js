/* @flow */

import type { DirectiveNode } from 'graphql/language';
import { GraphQLDeprecatedDirective } from 'graphql/type';
import { getArgumentValues } from 'graphql/execution/values';

/**
 * Retrieves the deprecation reason given the directives of an AST.
 *
 * Mirror of [getDeprecationReason]{@link https://github.com/graphql/graphql-js/blob/master/src/utilities/buildASTSchema.js#L468}.
 */
export default function getDeprecationReason(directives: ?Array<DirectiveNode>): ?string {
  const deprecatedNode = directives && directives
    .find(directive => directive.name.value === GraphQLDeprecatedDirective.name);

  if (!deprecatedNode) return undefined;

  return (getArgumentValues(GraphQLDeprecatedDirective, deprecatedNode).reason: any);
}
