import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@repo/client-auth/provider';
import { AUTH_SEARCH_PARAMS, AUTH_ROUTES } from '@repo/client-auth/router';
import { toast } from '@repo/ui';
import { APP_ROUTES } from './constants';

export const useDeepLinks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.api.onDeepLink(async (url) => {
      try {
        const { pathname, searchParams, hash } = new URL(url);

        const code = searchParams.get(AUTH_SEARCH_PARAMS.CODE);
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw new Error('Failed to exchange code for session');
        }

        let redirectPath = pathname;
        // add a shim for the profile path since we use search params to show it via a dialog
        const profilePath = pathname === AUTH_ROUTES.PROFILE;
        if (profilePath) redirectPath = APP_ROUTES.PROFILE;
        // add a shim for the new password path since we use search params to show it via a dialog
        const newPasswordPath = pathname === AUTH_ROUTES.NEW_PASSWORD;
        if (newPasswordPath) redirectPath = APP_ROUTES.NEW_PASSWORD;

        navigate(`${redirectPath}${hash}`, { replace: true });
      } catch (error) {
        const errorMessage = error instanceof Error && error.message ? error.message : 'Unknown error';
        toast.error(`Invalid deep link: ${errorMessage}`);
      }
    });
  }, [navigate]);
};
