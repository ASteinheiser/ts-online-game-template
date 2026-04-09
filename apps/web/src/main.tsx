import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import ReactGA from 'react-ga4';
import { Toaster } from '@repo/ui';
import { SessionProvider } from '@repo/client-auth/provider';
import { client } from './graphql/client';
import { router } from './router';
import './theme.css';

// TOOD: update this with your own GA4 measurement ID or remove if you don't want to use Google Analytics
ReactGA.initialize('G-2PW3QM6SMP');
ReactGA.send({ hitType: 'pageview', page: '/', title: 'TS Online Game Template' });

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
