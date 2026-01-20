import { useEffect, useRef } from 'react';
import type { ProgressInfo } from 'electron-updater';
import { toast } from '@repo/ui';

interface AutoUpdateProviderProps {
  children: React.ReactNode;
}

export const AutoUpdateProvider = ({ children }: AutoUpdateProviderProps) => {
  const toastIdRef = useRef<string | number | undefined>();

  useEffect(() => {
    window.api.updates.onDownloadProgress((progress: ProgressInfo) => {
      const percent = Math.round(progress.percent);

      if (toastIdRef.current === undefined) {
        toastIdRef.current = toast(`Downloading update... ${percent}%`, {
          id: 'update-download',
          duration: Infinity,
        });
      } else {
        toast(`Downloading update… ${percent}%`, {
          id: toastIdRef.current,
          duration: Infinity,
        });
      }

      if (percent >= 100) {
        toast.dismiss(toastIdRef.current);
      }
    });
  }, []);

  return children;
};
