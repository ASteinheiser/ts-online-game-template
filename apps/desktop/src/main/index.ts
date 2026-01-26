import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { optimizer, is } from '@electron-toolkit/utils';
import { ELECTRON_EVENTS } from '../shared/constants';
import type { VideoSettings } from '../shared/types';
import {
  getAvailableResolutions,
  loadVideoSettings,
  applyVideoSettings,
  saveVideoSettings,
  handleExitFullscreen,
  detectDisplayChange,
} from './video-settings';
import { initAutoUpdater } from './auto-updater';
import { registerLinuxApp } from './register-linux-app';

const DEEP_LINK_PROTOCOL = import.meta.env.VITE_DEEP_LINK_PROTOCOL;
if (!DEEP_LINK_PROTOCOL) throw new Error('VITE_DEEP_LINK_PROTOCOL is not set');

let mainWindow: BrowserWindow | null = null;
let pendingDeepLink: string | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    // settings to create an OS-agnostic experience
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    hasShadow: false,
    // windows needs to always be resizable
    resizable: process.platform === 'win32',
    // preload script for renderer process
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  });

  // Initialize auto-updater
  initAutoUpdater(mainWindow);

  // prevent manual resize when not in fullscreen (for windows)
  mainWindow.on('will-resize', (event) => {
    if (!mainWindow?.isFullScreen()) event.preventDefault();
  });
  // handle manual and programmatic fullscreen changes
  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send(ELECTRON_EVENTS.ON_FULLSCREEN_CHANGED, true);
    saveVideoSettings({ ...loadVideoSettings(), fullscreen: true });
  });
  // handle manual and programmatic fullscreen exit
  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send(ELECTRON_EVENTS.ON_FULLSCREEN_CHANGED, false);
    setImmediate(() => {
      const videoSettings = loadVideoSettings();
      handleExitFullscreen(mainWindow, videoSettings);
    });
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    // handle display change on startup
    const initialResolution = detectDisplayChange(mainWindow);
    // handles setting resolution and fullscreen on startup
    applyVideoSettings(mainWindow, initialResolution);

    if (pendingDeepLink) {
      mainWindow?.webContents.send(ELECTRON_EVENTS.DEEP_LINK, pendingDeepLink);
      pendingDeepLink = null;
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Ensure app is "installed" for Linux users
  registerLinuxApp();

  // Register protocol for deep links
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient(DEEP_LINK_PROTOCOL, process.execPath, [
      join(process.cwd(), process.argv[1] ?? ''),
    ]);
  } else {
    app.setAsDefaultProtocolClient(DEEP_LINK_PROTOCOL);
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Create the desktop window
  createWindow();

  // IPC handlers for video settings
  ipcMain.handle(ELECTRON_EVENTS.QUIT_APP, () => app.quit());
  ipcMain.handle(ELECTRON_EVENTS.GET_AVAILABLE_RESOLUTIONS, () => getAvailableResolutions(mainWindow));
  ipcMain.handle(ELECTRON_EVENTS.GET_VIDEO_SETTINGS, () => loadVideoSettings());
  ipcMain.handle(ELECTRON_EVENTS.SET_VIDEO_SETTINGS, (_, newSettings: Partial<VideoSettings>) =>
    applyVideoSettings(mainWindow, newSettings)
  );
});

// Enforce single instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  // Deep link handling
  app.on('second-instance', (_event, argv) => {
    const url = argv.find((a) => a.startsWith(`${DEEP_LINK_PROTOCOL}://`));
    if (url) {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        mainWindow.webContents.send(ELECTRON_EVENTS.DEEP_LINK, url);
      } else {
        pendingDeepLink = url;
      }
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.webContents.send(ELECTRON_EVENTS.DEEP_LINK, url);
    } else {
      pendingDeepLink = url;
    }
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
