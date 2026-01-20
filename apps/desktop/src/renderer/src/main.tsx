import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@repo/ui';
import { SessionProvider } from '@repo/client-auth/provider';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/client';
import { router } from './router';
import { AudioSettingsProvider } from './providers/AudioSettingsProvider';
import { AutoUpdateProvider } from './providers/AutoUpdateProvider';
import { SplashProvider } from './providers/SplashProvider';
import { VideoSettingsProvider } from './providers/VideoSettingsProvider';
import './theme.css';

/** this is required by the content security policy defined in index.html */
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('VITE_API_URL is not set');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AutoUpdateProvider>
        <VideoSettingsProvider>
          <AudioSettingsProvider>
            <SplashProvider>
              <SessionProvider healthCheckEnabled isDesktop>
                <RouterProvider router={router} />
              </SessionProvider>
            </SplashProvider>
          </AudioSettingsProvider>
        </VideoSettingsProvider>
      </AutoUpdateProvider>
    </ApolloProvider>

    <Toaster />
  </StrictMode>
);
