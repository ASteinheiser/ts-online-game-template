// -----------------------------------------------------------------------------
// Video settings helpers (fullscreen + fixed resolutions)
// -----------------------------------------------------------------------------
import { app, screen, type BrowserWindow } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'path';
import type { VideoSettings } from '../shared/types';

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
export const saveVideoSettings = (settings: VideoSettings) => {
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

  if (mergedSettings.fullscreen) {
    window.setFullScreen(true);
    saveVideoSettings(mergedSettings);
  } else if (window.isFullScreen()) {
    window.setFullScreen(false);
    saveVideoSettings(mergedSettings);
  } else {
    handleExitFullscreen(window, mergedSettings);
  }
};

export const handleExitFullscreen = (window: BrowserWindow | null, videoSettings: VideoSettings) => {
  const { x, y } = window?.getBounds() ?? { x: 0, y: 0 };
  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  const { width, height } = currentDisplay.workAreaSize;

  let actualWidth = videoSettings.width;
  let actualHeight = videoSettings.height;
  if (width < videoSettings.width) actualWidth = width;
  if (height < videoSettings.height) actualHeight = height;

  window?.setContentSize(actualWidth, actualHeight);
  window?.center();
  saveVideoSettings({ ...videoSettings, fullscreen: false });
};

export const detectDisplayChange = (window: BrowserWindow | null) => {
  const existingSettings = loadVideoSettings();

  const { x, y } = window?.getBounds() ?? { x: 0, y: 0 };
  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  const { width: displayWidth, height: displayHeight } = currentDisplay.size;

  if (displayWidth < existingSettings.width || displayHeight < existingSettings.height) {
    const requestedSizeIndex = COMMON_RESOLUTIONS.findIndex(
      ({ width, height }) => width === existingSettings.width && height === existingSettings.height
    );
    if (requestedSizeIndex > 0) {
      return COMMON_RESOLUTIONS[requestedSizeIndex - 1];
    }
  }
  return existingSettings;
};
