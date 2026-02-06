import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../router/constants';

const REDIRECT_DELAY_MS = 3000;

export const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => navigate(APP_ROUTES.HOME), REDIRECT_DELAY_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fullscreen-center px-4">
      <span className="text-2xl font-title text-center">Oops! Page not found. Redirecting home...</span>
    </div>
  );
};
