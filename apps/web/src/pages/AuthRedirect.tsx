import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AUTH_SEARCH_PARAMS, AUTH_ROUTES } from '@repo/client-auth/router';
import { supabase } from '@repo/client-auth/provider';
import { Button, toast } from '@repo/ui';

/** enables smoother UX when redirecting and opening deep links */
const REDIRECT_DELAY_MS = 100;
const WEB_PATH_FALLBACK: string = AUTH_ROUTES.LOGIN;

export const AuthRedirect = () => {
  const { search, hash } = useLocation();
  const navigate = useNavigate();

  const { code, webUrl, deepLinkUrl } = useMemo(() => {
    const params = new URLSearchParams(search);

    const webPathParam = params.get(AUTH_SEARCH_PARAMS.REDIRECT);
    const deepLinkPathParam = params.get(AUTH_SEARCH_PARAMS.DEEP_LINK);
    const codeParam = params.get(AUTH_SEARCH_PARAMS.CODE);

    const webRedirectUrl = webPathParam || WEB_PATH_FALLBACK;

    let deepLinkRedirectUrl: string | null = null;
    if (deepLinkPathParam) {
      const codeQuery = codeParam ? `?${AUTH_SEARCH_PARAMS.CODE}=${codeParam}` : '';
      deepLinkRedirectUrl = `${deepLinkPathParam}${codeQuery}${hash}`;
    }

    return { code: codeParam, webUrl: webRedirectUrl, deepLinkUrl: deepLinkRedirectUrl };
  }, [search, hash]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (deepLinkUrl) handleOpenInApp();
      else handleOpenInWeb();
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [deepLinkUrl, webUrl]);

  const handleOpenInApp = () => {
    if (!deepLinkUrl) return;
    window.location.assign(deepLinkUrl);
  };

  const handleContinueOnWeb = () => {
    navigate(WEB_PATH_FALLBACK, { replace: true });
  };

  const handleOpenInWeb = async () => {
    try {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw new Error('Failed to exchange code for session');
      }
      navigate(webUrl, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error && error.message ? error.message : 'Unknown error';
      toast.error(`Error: ${errorMessage}`);
      navigate(WEB_PATH_FALLBACK, { replace: true });
    }
  };

  return (
    <div className="fullscreen-center gap-6 text-center">
      <p className="text-3xl font-label text-muted max-w-sm">
        You should be redirected to the native app. If so, you can
        <span className="font-pixel text-primary text-4xl"> close this page</span>
        <br />
        Otherwise, you can try to:
      </p>
      <div className="flex gap-4 justify-center">
        <Button size="lg" disabled={!deepLinkUrl} onClick={handleOpenInApp}>
          Open in app
        </Button>
        <Button size="lg" variant="secondary" onClick={handleContinueOnWeb}>
          Continue on web
        </Button>
      </div>
    </div>
  );
};
