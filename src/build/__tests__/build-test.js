/* eslint-env jest */

import {
  GraphQLSchema,
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql/type';
import { parse } from 'graphql/language';
import { expectTypesEqual, expectSchemasEqual } from './comparators';
import build, { buildTypes } from '../';

const querySource = `
 type Query {
   ok: Boolean!
 }
`;
const generateQuery = (resolve) => new GraphQLObjectType({
  name: 'Query',
  fields: { ok: { type: new GraphQLNonNull(GraphQLBoolean), resolve } },
});
const schemaSource = `
  schema {
    query: Query
  }
`;
const Schema = new GraphQLSchema({ query: generateQuery() });
const timestampSource = `
  scalar Timestamp
`;
const serialize = (date) => Date.prototype.toISOString.call(date);
const Timestamp = new GraphQLScalarType({ name: 'Timestamp', serialize });
const recordSource = `
  interface Record {
    id: ID!
    createdAt: Timestamp!
    updatedAt: Timestamp!
  }
`;
const Record = new GraphQLInterfaceType({
  name: 'Record',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    createdAt: { type: new GraphQLNonNull(Timestamp) },
    updatedAt: { type: new GraphQLNonNull(Timestamp) },
  },
});

describe('buildTypes()', () => {
  it('should work without types in AST', () => {
    expect(buildTypes(parse(schemaSource))).toEqual([]);
  });

  it('should work with types in AST', () => {
    buildTypes(parse(querySource))
      .forEach((type, i) => expectTypesEqual(type, [generateQuery()][i]));
  });

  it('should work with config map', () => {
    const ok = () => true;
    buildTypes(parse(querySource), { Query: { ok } })
      .forEach((type, i) => expectTypesEqual(type, [generateQuery(ok)][i]));
  });

  it('should work with type dependencies', () => {
    buildTypes(parse(recordSource), undefined, [Timestamp])
      .forEach((type, i) => expectTypesEqual(type, [Record, Timestamp][i]));
  });

  it('should throw with duplicate types in type dependencies', () => {
    const msg = `Duplicate type "${Record.name}" in schema definition or type dependencies.`;
    expect(() => {
      const types = buildTypes(parse(recordSource), undefined, [Record]);
      types[0].getFields();
    }).toThrowError(msg);
    expect(() => {
      const types = buildTypes(parse(querySource + recordSource), undefined, [Record]);
      types[1].getFields();
    }).toThrowError(msg);
  });
});

describe('build()', () => {
  it('should throw if source is not a string', () => {
    expect(() => build()).toThrowError('Expected a string but got undefined.');
  });

  it('should throw if config is not an object', () => {
    expect(() => build(querySource, null)).toThrowError('Expected an object but got null.');
  });

  it('should throw if types is not an array or a function', () => {
    expect(() => build(querySource, undefined, null))
      .toThrowError('Expected an array or a function but got null.');
  });

  it('should throw if inference flag is not a boolean', () => {
    expect(() => build(querySource, undefined, undefined, null))
      .toThrowError('Expected a boolean but got null.');
  });

  it('should allow config, types, and inference flag to be optional', () => {
    expectTypesEqual(build(querySource, {}, false), generateQuery());
    expectTypesEqual(build(querySource, [], false), generateQuery());
    expectSchemasEqual(build(querySource, []), Schema);
    expectTypesEqual(build(querySource, false), generateQuery());
  });

  it('should throw with duplicate types in AST', () => {
    expect(() => build(recordSource + recordSource))
      .toThrowError(`Duplicate type "${Record.name}" in schema definition or type dependencies.`);
  });

  it('should throw with duplicate schema declarations', () => {
    expect(() => build(schemaSource + schemaSource))
      .toThrowError('Must provide only one schema definition.');
  });

  it('should work with one type in source', () => {
    expectTypesEqual(build(recordSource, undefined, [Timestamp]), Record);
  });

  it('should throw if building a schema and types is not an array', () => {
    const msg = 'Can\'t use thunks as type dependencies for schema.';
    expect(() => build(schemaSource + querySource, undefined, () => {})).toThrowError(msg);
    expect(() => build(querySource, undefined, () => {})).toThrowError(msg);
  });

  it('should work with schema in source', () => {
    expectSchemasEqual(build(schemaSource + querySource), Schema);
  });

  it('should work with inferred schema', () => {
    expectSchemasEqual(build(querySource), Schema);
  });

  it('should allow to skip schema inference', () => {
    expectTypesEqual(build(querySource, undefined, undefined, false), generateQuery());
  });

  it('should work with multiple types in source', () => {
    Object.values(build(recordSource + timestampSource, {
      Timestamp: { serialize },
    })).forEach((type, i) => expectTypesEqual(type, [Record, Timestamp][i]));
    Object.values(build(recordSource + timestampSource, {
      Timestamp: { serialize },
    }, undefined, false)).forEach((type, i) => expectTypesEqual(type, [Record, Timestamp][i]));
  });
});
