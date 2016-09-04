# graphql-utilities
[![npm version](https://badge.fury.io/js/graphql-utilities.svg)](https://badge.fury.io/js/graphql-utilities) [![Build Status](https://travis-ci.org/bloveit/graphql-utilities.svg?branch=master)](https://travis-ci.org/bloveit/graphql-utilities) [![Coverage Status](https://coveralls.io/repos/github/bloveit/graphql-utilities/badge.svg?branch=master)](https://coveralls.io/github/bloveit/graphql-utilities?branch=master)

## Why?
There are various libraries out there providing utilities for GraphQL and even the [reference implementation](https://github.com/graphql/graphql-js) itself is adding [new utilities](https://github.com/graphql/graphql-js/pull/471). So why do we need another one?

**GraphQL Types**
None of those libraries let you build GraphQL types using the schema language. This prevents gradual adoption of these libraries and makes code separation a nightmare.

`build` makes it extremely simple to build a GraphQLType.

```js
build(`
  type Query {
    ok: Boolean!
  }
`);

/* is equivalent to */

new GraphQLObjectType({
  name: 'Query',
  fields: {
    ok: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
})
```

## Installation
```
npm install --save graphql-utilities
```

## Getting Started
Currently GraphQL Utilities only exports one function, `build`.

```js
import { build } from 'graphql-utilities';

// you can build a type
const Record = build(`
  interface Record {
    id: ID!
  }
`);

// or you can build a schema
const Schema = build(`
  schema {
    query: Query
  }

  type Query {
    ok: Boolean!
  }
`);
```

## TODO
- [ ] Add detailed API docs.
- [ ] Make `build` configuration argument interchangeable with types.
- [ ] Allow `build` to accept a flag to skip inferred schema.

## License
MIT
