import { useEffect, useRef, useState } from 'react';
import type { ProgressInfo } from 'electron-updater';
import { Dialog, DialogContent, DialogTitle, DialogDescription, toast } from '@repo/ui';

interface AutoUpdateProviderProps {
  children: React.ReactNode;
}

export const AutoUpdateProvider = ({ children }: AutoUpdateProviderProps) => {
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const toastIdRef = useRef<string | number | undefined>();

  useEffect(() => {
    window.api.updates.onDownloadProgress((progress: ProgressInfo) => {
      const percent = Math.round(progress.percent);

      if (toastIdRef.current === undefined) {
        setShowUpdateMessage(true);
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

  return (
    <>
      {children}

      <Dialog open={showUpdateMessage} onOpenChange={setShowUpdateMessage}>
        <DialogContent className="max-w-md" aria-describedby={undefined} disableCloseButton>
          <DialogTitle className="text-4xl font-pixel text-center text-muted-foreground">
            Automatic update started...
          </DialogTitle>
          <DialogDescription className="text-center mt-4 text-lg">
            You will be able to rejoin your session once the download completes and the app restarts
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};
