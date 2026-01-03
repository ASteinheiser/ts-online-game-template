import { createContext, useContext, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import type {
  Session,
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  UserResponse,
} from '@supabase/supabase-js';
import { Button, LoadingSpinner, toast } from '@repo/ui';
import { supabase } from './supabase-client';
import type { Auth_GetProfileQuery, Auth_GetProfileQueryVariables } from '../graphql';
import { buildAuthRedirect } from '../router/buildAuthRedirect';
import { AUTH_ROUTES } from '../router/constants';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { SUPABASE_AUTH } from './constants';

const GET_PROFILE = gql`
  query Auth_GetProfile {
    profile {
      userName
    }
  }
`;

export type Profile = NonNullable<Auth_GetProfileQuery['profile']>;

interface SessionContextType {
  session: Session | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<AuthTokenResponsePassword>;
  signup: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<{ error: AuthError | null }>;
  forgotPassword: (email: string) => Promise<{ error: AuthError | null }>;
  newPassword: (password: string) => Promise<UserResponse>;
  changeEmail: (email: string) => Promise<UserResponse>;
  refetchProfile: () => Promise<void>;
}

const dummyAsyncFunc = async () => {
  throw new Error('not loaded');
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  profile: null,
  login: dummyAsyncFunc,
  signup: dummyAsyncFunc,
  logout: dummyAsyncFunc,
  forgotPassword: dummyAsyncFunc,
  newPassword: dummyAsyncFunc,
  changeEmail: dummyAsyncFunc,
  refetchProfile: dummyAsyncFunc,
});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
  healthCheckEnabled?: boolean;
  isDesktop?: boolean;
}

export const SessionProvider = ({
  children,
  healthCheckEnabled = false,
  isDesktop = false,
}: SessionProviderProps) => {
  const client = useApolloClient();

  const {
    isHealthy,
    loading: isHealthCheckLoading,
    refetch: refetchHealthCheck,
  } = useHealthCheck({
    enabled: healthCheckEnabled,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession((prevSession) => {
        // only set loading state on initial load -- prevents showing create profile when logging in
        if (newSession && prevSession === null) setIsLoading(true);
        return newSession;
      });
    });

    return () => {
      authStateListener.data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        // swallow error if session is missing -- this is expected when user is logged out
        if (error && error.name !== 'AuthSessionMissingError') throw error;
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong refreshing your session...');
      }
    };

    window.addEventListener('focus', refresh);
    // handles when user regains network connection after being offline
    window.addEventListener('online', refresh);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    };
  }, []);

  useEffect(() => {
    if (healthCheckEnabled && !isHealthy) {
      // if still loading, wait for server to be healthy before fetching profile
      if (isHealthCheckLoading) return;
      // otherwise, assume server is down -- don't fetch profile, set loading to false
      setIsLoading(false);
      return;
    }
    // if no session, remove existing profile and don't try to fetch
    if (!session) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    getProfile(session);
  }, [session, healthCheckEnabled, isHealthy, isHealthCheckLoading]);

  const getProfile = async (_session: Session) => {
    try {
      const { data, error } = await client.query<Auth_GetProfileQuery, Auth_GetProfileQueryVariables>({
        query: GET_PROFILE,
        context: { headers: { authorization: _session.access_token } },
        fetchPolicy: 'network-only',
      });
      if (error) throw error;

      const newProfile = data?.profile ?? null;
      // handle case where account is deleted from another client, ensure auth user still exists
      if (!newProfile) {
        const userRes = await supabase.auth.getUser();
        if (!userRes?.data?.user) {
          await logout();
          return;
        }
      }

      setProfile(newProfile);
      setProfileError(false);
    } catch (error) {
      console.error(error);
      toast.error('Oops! Something went wrong fetching your profile...');
      setProfileError(true);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signup = async (email: string, password: string) => {
    const emailRedirectTo = buildAuthRedirect(AUTH_ROUTES.CREATE_PROFILE, isDesktop);
    return await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
  };

  const logout = async () => {
    setIsLoading(true);
    const result = await supabase.auth.signOut();

    setSession(null);
    setProfile(null);
    setProfileError(false);
    setIsLoading(false);
    return result;
  };

  const forgotPassword = async (email: string) => {
    const redirectTo = buildAuthRedirect(AUTH_ROUTES.NEW_PASSWORD, isDesktop);
    return await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  };

  const newPassword = async (password: string) => {
    return await supabase.auth.updateUser({ password });
  };

  const changeEmail = async (email: string) => {
    const emailRedirectTo = buildAuthRedirect(
      `${AUTH_ROUTES.PROFILE}${SUPABASE_AUTH.HASH.EMAIL_CHANGE_SUCCESS}`,
      isDesktop
    );
    return await supabase.auth.updateUser({ email }, { emailRedirectTo });
  };

  const refetchProfile = async () => {
    if (session) await getProfile(session);
  };

  const renderContent = () => {
    if (isLoading || isHealthCheckLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      );
    }

    if (profileError || (healthCheckEnabled && !isHealthy)) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center flex flex-col">
            <h1 className="text-3xl font-bold">Oops! Sorry about that...</h1>
            <p className="text-lg text-muted pt-4 pb-6">There was an issue connecting to the server</p>

            <Button size="lg" onClick={profileError ? refetchProfile : refetchHealthCheck}>
              Try Again
            </Button>

            {profileError && (
              <Button size="lg" variant="secondary" onClick={logout} className="mt-4">
                Logout
              </Button>
            )}
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        profile,
        login,
        signup,
        logout,
        forgotPassword,
        newPassword,
        changeEmail,
        refetchProfile,
      }}
    >
      {renderContent()}
    </SessionContext.Provider>
  );
};
