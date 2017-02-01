import { GraphQLSchema } from 'graphql/type';
import produceType from './produceType';

export const buildOperation = (schemaAST, operation, types) => {
  const operationAST = schemaAST.operationTypes.find(ast => ast.operation === operation);
  return operationAST && produceType(operationAST.type, types);
};

export default function buildSchema(schemaAST, { types, directives } = {}, typeDeps) {
  const query = buildOperation(schemaAST, 'query', typeDeps);
  const mutation = buildOperation(schemaAST, 'mutation', typeDeps);
  const subscription = buildOperation(schemaAST, 'subscription', typeDeps);
  const schemaConfig = { types, directives };
  if (query) schemaConfig.query = query;
  if (mutation) schemaConfig.mutation = mutation;
  if (subscription) schemaConfig.subscription = subscription;
  return new GraphQLSchema(schemaConfig);
}
