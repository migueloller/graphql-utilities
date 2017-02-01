import { GraphQLSchema } from 'graphql/type';
import { Kind, parse } from 'graphql/language';
import buildSchema from './buildSchema';
import buildScalar from './buildScalar';
import buildObject from './buildObject';
import buildInterface from './buildInterface';
import buildUnion from './buildUnion';
import buildEnum from './buildEnum';
import buildInputObject from './buildInputObject';
import resolveThunk from './resolveThunk';

const buildMap = {
  [Kind.SCALAR_TYPE_DEFINITION]: buildScalar,
  [Kind.OBJECT_TYPE_DEFINITION]: buildObject,
  [Kind.INTERFACE_TYPE_DEFINITION]: buildInterface,
  [Kind.UNION_TYPE_DEFINITION]: buildUnion,
  [Kind.ENUM_TYPE_DEFINITION]: buildEnum,
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: buildInputObject,
};

export const SCHEMA_CONFIG_KEY = '__schema';

export const ensureNoDuplicateTypes = (types) => {
  types.forEach((typeA) => {
    if (types.some(typeB => typeA !== typeB && typeA.name === typeB.name)) {
      throw new Error(`Duplicate type "${typeA.name}" in schema definition or type dependencies.`);
    }
  });
  return types;
};

export const buildTypes = (documentAST, configMap = {}, typeDependencies = []) => {
  const derived = documentAST.definitions.map((definition) => {
    const buildDefinition = buildMap[definition.kind];
    if (!buildDefinition) return false;
    return buildDefinition(
      definition,
      configMap[definition.name.value],
      () => ensureNoDuplicateTypes([...derived, ...resolveThunk(typeDependencies)]),
    );
  }).filter(x => x);
  return derived;
};

export default function build(source, config = {}, typeDeps = [], infer = true) {
  if (typeof source !== 'string') throw new Error(`Expected a string but got ${source}.`);

  /* eslint-disable no-param-reassign */
  if (Array.isArray(config) || typeof config === 'function') {
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

  if (!(config instanceof Object)) throw new Error(`Expected an object but got ${config}.`);
  if (!(Array.isArray(typeDeps) || typeof typeDeps === 'function')) {
    throw new Error(`Expected an array or a function but got ${typeDeps}.`);
  }
  if (typeof infer !== 'boolean') throw new Error(`Expected a boolean but got ${infer}.`);

  const documentAST = parse(source);
  const { definitions } = documentAST;
  const firstDefinition = definitions[0];
  const shouldReturnOneType = (
    definitions.length === 1 &&
    ~Object.keys(buildMap).indexOf(firstDefinition.kind) && // eslint-disable-line no-bitwise
    !(firstDefinition.name.value === 'Query' && infer)
  );
  const types = ensureNoDuplicateTypes(buildTypes(
    documentAST,
    shouldReturnOneType ? { [firstDefinition.name.value]: config } : config,
    typeDeps,
  ));

  if (shouldReturnOneType) return types[0];

  // try to build the defined schema
  const schemaASTs = definitions.filter(({ kind }) => kind === Kind.SCHEMA_DEFINITION);
  if (schemaASTs.length > 1) throw new Error('Must provide only one schema definition.');
  if (schemaASTs.length === 1) {
    if (!Array.isArray(typeDeps)) {
      throw new Error('Can\'t use thunks as type dependencies for schema.');
    }
    return buildSchema(
      schemaASTs[0],
      config[SCHEMA_CONFIG_KEY],
      () => ensureNoDuplicateTypes([...types, ...typeDeps]),
    );
  }

  // try to build an inferred schema
  if (infer) {
    const QueryType = types.find(({ name }) => name === 'Query');
    if (QueryType) {
      if (!Array.isArray(typeDeps)) {
        throw new Error('Can\'t use thunks as type dependencies for schema.');
      }
      const allTypes = ensureNoDuplicateTypes([...types, ...typeDeps]);
      return new GraphQLSchema({
        query: QueryType,
        mutation: allTypes.find(({ name }) => name === 'Mutation'),
        subscription: allTypes.find(({ name }) => name === 'Subscription'),
      });
    }
  }

  // return a type map
  return types.reduce((map, type) => ({ ...map, [type.name]: type }), {});
}
