import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';

/** This is how long to show the splash screen. Should match 'splash-fade' animation in theme.css (4s) */
const SPLASH_DURATION = 4 * 1000;

interface SplashProviderProps {
  children: React.ReactNode;
}
/**
 * This will play only once when the app is first opened.
 * Good place to put developer and/or publisher logos.
 */
export const SplashProvider = ({ children }: SplashProviderProps) => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsSplashVisible(false), SPLASH_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  if (!isSplashVisible) return children;

  return (
    <div className="fullscreen-center splash-fade" style={{ userSelect: 'none' }}>
      <img src={logo} className="h-40 w-auto mb-15" />
      <h1 className="text-5xl font-pixel text-primary">iamandrew.io games</h1>
    </div>
  );
};
