import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { ELECTRON_EVENTS } from '../shared/constants';
import type { DeepLinkCallback, CustomAPI } from './index.d';

/** stores the deep-link listener callback (preload -> renderer) */
let deepLinkListener: DeepLinkCallback | null = null;
/** stores a deep-link that was received before a listener attaches (cold start) */
let pendingDeepLink: string | null = null;

const deliverDeepLink = (url: string) => {
  if (deepLinkListener) deepLinkListener(url);
  // handle deep links when the app is not open/ready (cold start)
  else pendingDeepLink = url;
};

// Always-on listener from main process → preload
ipcRenderer.on(ELECTRON_EVENTS.DEEP_LINK, (_event, url: string) => {
  deliverDeepLink(url);
});

// Custom API for renderer
const api: CustomAPI = {
  onDeepLink: (callback) => {
    // setup the deep-link listener (preload -> renderer)
    deepLinkListener = callback;
    // Replay cold start deep-links (if any) once
    if (pendingDeepLink) {
      const url = pendingDeepLink;
      pendingDeepLink = null;
      deliverDeepLink(url);
    }
  },
  quitApp: () => ipcRenderer.invoke(ELECTRON_EVENTS.QUIT_APP),
  video: {
    getAvailableResolutions: () => ipcRenderer.invoke(ELECTRON_EVENTS.GET_AVAILABLE_RESOLUTIONS),
    getVideoSettings: () => ipcRenderer.invoke(ELECTRON_EVENTS.GET_VIDEO_SETTINGS),
    setVideoSettings: (settings) => ipcRenderer.invoke(ELECTRON_EVENTS.SET_VIDEO_SETTINGS, settings),
    onFullscreenChanged: (callback) =>
      ipcRenderer.on(ELECTRON_EVENTS.ON_FULLSCREEN_CHANGED, (_, isFullscreen) => callback(isFullscreen)),
  },
  updates: {
    onDownloadProgress: (callback) =>
      ipcRenderer.on(ELECTRON_EVENTS.UPDATE_PROGRESS, (_, progress) => callback(progress)),
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
