import { createContext, useContext, useEffect, useState } from 'react';
import type { ResolutionOption } from '../../../shared/types';

interface VideoSettingsContextType {
  isFullscreen: boolean;
  currentResolution: ResolutionOption;
  availableResolutions: Array<ResolutionOption>;
  refetchResolutions: () => Promise<void>;
  changeFullscreen: (fullscreen: boolean) => Promise<void>;
  changeResolution: (resolution: ResolutionOption) => Promise<void>;
}

const VideoSettingsContext = createContext<VideoSettingsContextType>({
  isFullscreen: false,
  currentResolution: { width: 0, height: 0 },
  availableResolutions: [],
  refetchResolutions: async () => {},
  changeFullscreen: async () => {},
  changeResolution: async () => {},
});

export const useVideoSettings = () => {
  const context = useContext(VideoSettingsContext);
  if (!context) {
    throw new Error('useVideoSettings must be used within a VideoSettingsProvider');
  }
  return context;
};

export const VideoSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentResolution, setCurrentResolution] = useState<ResolutionOption>({ width: 0, height: 0 });
  const [availableResolutions, setAvailableResolutions] = useState<Array<ResolutionOption>>([]);

  useEffect(() => {
    handleLoadVideoSettings();
  }, []);

  const handleLoadVideoSettings = async () => {
    // listen for fullscreen changes
    window.api.video.onFullscreenChanged(setIsFullscreen);

    const [resolutions, { fullscreen, width, height }] = await Promise.all([
      window.api.video.getAvailableResolutions(),
      window.api.video.getVideoSettings(),
    ]);
    setAvailableResolutions(resolutions);
    setCurrentResolution({ width, height });
    setIsFullscreen(fullscreen);
  };

  const refetchResolutions = async () => {
    const resolutions = await window.api.video.getAvailableResolutions();
    setAvailableResolutions(resolutions);
  };

  const changeFullscreen = async (fullscreen: boolean) => {
    await window.api.video.setVideoSettings({ fullscreen });
    setIsFullscreen(fullscreen);
  };

  const changeResolution = async (resolution: ResolutionOption) => {
    await window.api.video.setVideoSettings(resolution);
    setCurrentResolution(resolution);
  };

  return (
    <VideoSettingsContext.Provider
      value={{
        isFullscreen,
        currentResolution,
        availableResolutions,
        refetchResolutions,
        changeFullscreen,
        changeResolution,
      }}
    >
      {/* allow the user to drag the window by the invisible "top bar" if not fullscreen */}
      {!isFullscreen && (
        <div
          className="fixed top-0 left-0 w-full h-5 bg-transparent"
          // @ts-expect-error electron can interpret this style and allow for dragging the native window
          style={{ WebkitAppRegion: 'drag' }}
        />
      )}

      {children}
    </VideoSettingsContext.Provider>
  );
};
