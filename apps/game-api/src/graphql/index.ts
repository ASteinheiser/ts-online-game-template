import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { resolvers } from './resolvers';
import type { Context } from './context';

const typeDefs = readFileSync(path.join(import.meta.dirname, 'schema.graphql'), 'utf8');

export const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});
