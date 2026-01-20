import { app, type BrowserWindow } from 'electron';
import ElectronUpdater from 'electron-updater';
import { ELECTRON_EVENTS } from '../shared/constants';

const { autoUpdater } = ElectronUpdater;
const POLL_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Initializes auto-updater to silently poll for and apply updates.
 *
 * Behaviour:
 * 1. Immediately checks for updates once the app is ready
 * 2. Polls for updates every 10 minutes
 * 3. Downloads any update found without prompting the user
 * 4. Forwards download progress to the renderer via IPC
 * 5. Restarts the app as soon as the download completes
 */
export const initAutoUpdater = (window: BrowserWindow | null) => {
  if (!window) return;

  if (!app.isPackaged) return; // Skip in development

  autoUpdater.on('download-progress', (progress) => {
    window.webContents.send(ELECTRON_EVENTS.UPDATE_PROGRESS, progress);
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall(true, true);
  });

  // Perform the first check right away
  autoUpdater.checkForUpdates();
  // Then poll for updates
  setInterval(() => autoUpdater.checkForUpdates(), POLL_INTERVAL);
};
