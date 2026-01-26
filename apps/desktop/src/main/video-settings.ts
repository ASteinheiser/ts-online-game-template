// -----------------------------------------------------------------------------
// Video settings helpers (fullscreen + fixed resolutions)
// -----------------------------------------------------------------------------
import { app, screen, type BrowserWindow } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'path';
import type { VideoSettings } from '../shared/types';
import { ELECTRON_EVENTS } from '../shared/constants';

/** Common desktop game resolutions – will be filtered by display size */
export const COMMON_RESOLUTIONS = [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 3840, height: 2160 },
] as const;

const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  fullscreen: false,
  ...COMMON_RESOLUTIONS[0],
};

/** Returns an array of supported resolutions filtered by current display size */
export const getAvailableResolutions = (window: BrowserWindow | null) => {
  if (!window) return [COMMON_RESOLUTIONS[0]];

  const { x, y } = window.getBounds();
  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  const { width, height } = currentDisplay.size;

  return COMMON_RESOLUTIONS.filter((res) => res.width <= width && res.height <= height);
};

/** Location of the JSON settings file in the user data directory (varies by OS) */
const getConfigFile = () => join(app.getPath('userData'), 'video-settings.json');

/** Persists the video settings to a JSON file */
const saveVideoSettings = (settings: VideoSettings) => {
  try {
    writeFileSync(getConfigFile(), JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save video settings', err);
  }
};

/** Loads the video settings from the JSON file */
export const loadVideoSettings = (): VideoSettings => {
  try {
    const settingsFile = getConfigFile();

    if (existsSync(settingsFile)) {
      const data = JSON.parse(readFileSync(settingsFile, 'utf-8'));
      const { fullscreen, width, height } = data || {};

      return {
        fullscreen: typeof fullscreen === 'boolean' ? fullscreen : DEFAULT_VIDEO_SETTINGS.fullscreen,
        width: typeof width === 'number' ? width : DEFAULT_VIDEO_SETTINGS.width,
        height: typeof height === 'number' ? height : DEFAULT_VIDEO_SETTINGS.height,
      };
    }
  } catch (err) {
    console.error('Failed to load video settings, falling back to defaults', err);
  }
  return DEFAULT_VIDEO_SETTINGS;
};

/** Applies the video settings to the window and persists them */
export const applyVideoSettings = (window: BrowserWindow | null, newSettings: Partial<VideoSettings>) => {
  if (!window) return;

  const existingSettings = loadVideoSettings();
  const mergedSettings = {
    fullscreen: newSettings.fullscreen ?? existingSettings.fullscreen,
    width: newSettings.width ?? existingSettings.width,
    height: newSettings.height ?? existingSettings.height,
  };

  const { x, y } = window.getBounds();
  const currentDisplay = screen.getDisplayNearestPoint({ x, y });

  window.setResizable(true);

  if (mergedSettings.fullscreen) {
    window.setFullScreen(true);
    window.once('enter-full-screen', () => {
      window.webContents.send(ELECTRON_EVENTS.ON_FULLSCREEN_CHANGED, true);
      window.setResizable(false);
    });
  } else {
    const { width: displayWidth, height: displayHeight } = currentDisplay.size;
    // if the display is smaller than the requested size
    if (displayWidth < mergedSettings.width || displayHeight < mergedSettings.height) {
      const requestedSizeIndex = COMMON_RESOLUTIONS.findIndex(
        ({ width, height }) => width === mergedSettings.width && height === mergedSettings.height
      );
      // select the next size down if it exists
      if (requestedSizeIndex > 0) {
        mergedSettings.width = COMMON_RESOLUTIONS[requestedSizeIndex - 1].width;
        mergedSettings.height = COMMON_RESOLUTIONS[requestedSizeIndex - 1].height;
      } // otherwise, just use the work area size (actual usable area of the display)
      else {
        mergedSettings.width = currentDisplay.workAreaSize.width;
        mergedSettings.height = currentDisplay.workAreaSize.height;
      }
    }

    const setWindowSize = () => {
      window.setSize(mergedSettings.width, mergedSettings.height);
      window.center();
      window.setResizable(false);
    };

    if (window.isFullScreen()) {
      window.setFullScreen(false);
      window.once('leave-full-screen', () => {
        window.webContents.send(ELECTRON_EVENTS.ON_FULLSCREEN_CHANGED, false);
        setWindowSize();
      });
    } else {
      setWindowSize();
    }
  }

  saveVideoSettings(mergedSettings);
};
