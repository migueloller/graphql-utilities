import { GraphQLSchema, GraphQLObjectType, GraphQLInt } from 'graphql/type';
import { parse } from 'graphql/language';
import buildSchema, { buildOperation } from '../buildSchema';

const generateSchemaAST = ({ query = 'Query', mutation, subscription } = {}) => parse(`
  schema {
    ${query == null ? '' : `query: ${query}`}
    ${mutation === undefined ? '' : `mutation: ${mutation}`}
    ${subscription === undefined ? '' : `subscription: ${subscription}`}
  }
`).definitions[0];
const generateObjectType = name => new GraphQLObjectType({
  name,
  fields: { field: { type: GraphQLInt } },
});
const typeDependencies = [generateObjectType('Query')];

describe('buildOperation()', () => {
  it('should work', () => {
    expect(buildOperation(generateSchemaAST(), 'query', typeDependencies));
  });
});

describe('buildSchema()', () => {
  const generateSchema = ({
    query = generateObjectType('Query'),
    mutation,
    subscription,
    types,
    directives,
  } = {}) => new GraphQLSchema({ query, mutation, subscription, types, directives });

  it('should throw without query in AST', () => {
    const Mutation = generateObjectType('Mutation');
    const Subscription = generateObjectType('Subscription');
    expect(() => buildSchema(generateSchemaAST({
      query: null, mutation: Mutation.name, subscription: Subscription.name,
    }), undefined, [Mutation, Subscription])).toThrow();
  });

  it('should work with query in AST', () => {
    expect(buildSchema(generateSchemaAST(), undefined, typeDependencies))
      .toEqual(generateSchema());
  });

  it('should work with query and mutation in AST', () => {
    const Mutation = generateObjectType('Mutation');
    expect(buildSchema(generateSchemaAST({
      mutation: Mutation.name,
    }), undefined, [...typeDependencies, Mutation]))
      .toEqual(generateSchema({ mutation: Mutation }));
  });

  it('should work with query and subscription in AST', () => {
    const Subscription = generateObjectType('Subscription');
    expect(buildSchema(generateSchemaAST({
      subscription: Subscription.name,
    }), undefined, [...typeDependencies, Subscription])).toEqual(generateSchema({
      subscription: Subscription,
    }));
  });

  it('should work with `types` in config', () => {
    const config = { types: [] };
    expect(buildSchema(generateSchemaAST(), config, typeDependencies))
      .toEqual(generateSchema(config));
  });

  it('should work with `directives` in config', () => {
    const config = { directives: [] };
    expect(buildSchema(generateSchemaAST(), config, typeDependencies))
      .toEqual(generateSchema(config));
  });
});
