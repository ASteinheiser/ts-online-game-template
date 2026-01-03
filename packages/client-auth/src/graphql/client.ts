import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { API_ROUTES } from '@repo/core-game';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('VITE_API_URL is not set');

export const client = new ApolloClient({
  link: new HttpLink({ uri: API_URL + API_ROUTES.GRAPHQL }),
  cache: new InMemoryCache(),
});
