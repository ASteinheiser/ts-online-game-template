import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@repo/ui';
import { SessionProvider } from '@repo/client-auth/provider';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/client';
import { router } from './router';
import './theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </ApolloProvider>

    <Toaster />
  </StrictMode>
);
