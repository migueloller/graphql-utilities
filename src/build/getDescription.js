/* @flow */

import type { Location } from 'graphql/language';
import { getDescription as get } from 'graphql/utilities/buildASTSchema';

export default function getDescription(node: { loc?: Location }) {
  return get(node) || undefined;
}
