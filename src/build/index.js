import { GraphQLSchema } from 'graphql/type';
import { Kind, parse } from 'graphql/language';
import buildSchema from './buildSchema';
import buildScalar from './buildScalar';
import buildObject from './buildObject';
import buildInterface from './buildInterface';
import buildUnion from './buildUnion';
import buildEnum from './buildEnum';
import buildInputObject from './buildInputObject';

const buildMap = {
  [Kind.SCALAR_TYPE_DEFINITION]: buildScalar,
  [Kind.OBJECT_TYPE_DEFINITION]: buildObject,
  [Kind.INTERFACE_TYPE_DEFINITION]: buildInterface,
  [Kind.UNION_TYPE_DEFINITION]: buildUnion,
  [Kind.ENUM_TYPE_DEFINITION]: buildEnum,
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: buildInputObject,
};

export const buildTypes = (documentAST, configMap = {}, typeDependencies = []) => {
  const derived = documentAST.definitions.map((definition) => {
    const buildDefinition = buildMap[definition.kind];
    if (!buildDefinition) return false;
    return buildDefinition(
      definition,
      configMap[definition.name.value],
      () => [...derived, ...typeDependencies],
    );
  }).filter((x) => x);
  return [...derived, ...typeDependencies];
};

export default function build(source, config = {}, typeDeps = [], infer = true) {
  if (typeof source !== 'string') throw new Error(`Expected a string but got ${source}`);

  /* eslint-disable no-param-reassign */
  if (Array.isArray(config)) {
    infer = typeof typeDeps === 'boolean' ? typeDeps : true;
    typeDeps = config;
    config = {};
  }

  if (typeof config === 'boolean') {
    infer = config;
    typeDeps = [];
    config = {};
  }

  if (typeof typeDeps === 'boolean') {
    infer = typeDeps;
    typeDeps = [];
  }
  /* eslint-enable no-param-reassign */

  if (!(config instanceof Object)) throw new Error(`Expected an object but got ${config}`);
  if (!Array.isArray(typeDeps)) throw new Error(`Expected an array but got ${typeDeps}`);
  if (typeof infer !== 'boolean') throw new Error(`Expected a boolean but got ${infer}`);

  const documentAST = parse(source);
  const { definitions } = documentAST;

  // if there is only one type definition and it's not named Query when inference is on, build the
  // type and return it
  if (
    definitions.length === 1 &&
    !(definitions[0].name.value === 'Query' && infer) &&
    ~Object.keys(buildMap).indexOf(definitions[0].kind)
  ) {
    const type = buildMap[definitions[0].kind](definitions[0], config, typeDeps);
    if (typeDeps.some(({ name }) => name === type.name)) {
      throw new Error(`Duplicate type "${type.name}"`);
    }
    return type;
  }

  const types = buildTypes(documentAST, config, typeDeps);
  // check for duplicate types
  types.forEach((typeA) => {
    if (types.some((typeB) => typeA !== typeB && typeA.name === typeB.name)) {
      throw new Error(`Duplicate type "${typeA.name}"`);
    }
  });

  // try to build the defined schema
  const schemaASTs = definitions.filter(({ kind }) => kind === Kind.SCHEMA_DEFINITION);
  if (schemaASTs.length > 1) throw new Error('Must provide only one schema definition.');
  if (schemaASTs.length === 1) return buildSchema(schemaASTs[0], config, types);

  // try to build an inferred schema
  if (infer) {
    const QueryType = types.find(({ name }) => name === 'Query');
    if (QueryType) {
      return new GraphQLSchema({
        query: QueryType,
        mutation: types.find(({ name }) => name === 'Mutation'),
        subscription: types.find(({ name }) => name === 'Subscription'),
        types: config.types,
        directives: config.directives,
      });
    }
  }

  // return a type map
  return types.reduce((map, type) => ({ ...map, [type.name]: type }), {});
}
