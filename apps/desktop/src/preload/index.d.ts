import type { ElectronAPI } from '@electron-toolkit/preload';
import type { ResolutionOption, VideoSettings } from '../shared/types';

export type DeepLinkCallback = (url: string) => void;

export interface CustomAPI {
  /** called once by the renderer to setup a deep-link listener */
  onDeepLink: (callback: DeepLinkCallback) => void;
  /** quits the application */
  quitApp: () => Promise<void>;
  /** video settings helpers */
  video: {
    /** Returns an array of supported resolutions filtered by current display */
    getAvailableResolutions: () => Promise<Array<ResolutionOption>>;
    /** Returns the currently saved video settings */
    getVideoSettings: () => Promise<VideoSettings>;
    /** Applies and persists new video settings */
    setVideoSettings: (settings: Partial<VideoSettings>) => Promise<void>;
    /** called once by the renderer to setup a fullscreen listener */
    onFullscreenChanged: (callback: (isFullscreen: boolean) => void) => void;
  };
  /** update helpers */
  updates: {
    /** called once by the renderer to setup a handler for download progress events */
    onDownloadProgress: (callback: (progress: Electron.DownloadProgress) => void) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomAPI;
  }
}
