import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';

const DEEP_LINK_PROTOCOL = import.meta.env.VITE_DEEP_LINK_PROTOCOL;
if (!DEEP_LINK_PROTOCOL) throw new Error('VITE_DEEP_LINK_PROTOCOL is not set');

const DESKTOP_FILE_NAME = `${DEEP_LINK_PROTOCOL}.desktop`;
const LINUX_DEEP_LINK_SCHEME = `x-scheme-handler/${DEEP_LINK_PROTOCOL}`;

/**
 * For AppImage builds:
 *
 *  - copies the bundled game-name.desktop to ~/.local/share/applications
 *  - updates the MIME database
 *  - sets game-name.desktop as the handler for x-scheme-handler/game-name
 *
 * It runs every time the app starts; existing files are simply overwritten
 */
export const registerLinuxDeepLink = async () => {
  if (process.platform !== 'linux' || !process.env.APPIMAGE) return;

  const bundledDesktop = path.join(app.getAppPath(), '..', '..', DESKTOP_FILE_NAME);

  const userAppsDir = path.join(
    process.env.XDG_DATA_HOME ?? path.join(process.env.HOME!, '.local', 'share'),
    'applications'
  );

  await fs.mkdir(userAppsDir, { recursive: true });
  const targetDesktop = path.join(userAppsDir, DESKTOP_FILE_NAME);

  await fs.copyFile(bundledDesktop, targetDesktop);

  // Rebuild the desktop MIME cache
  execFile('update-desktop-database', [userAppsDir], () => {
    // Tell xdg-mime that our desktop file handles the deep link scheme
    execFile('xdg-mime', ['default', DESKTOP_FILE_NAME, LINUX_DEEP_LINK_SCHEME]);
  });
};
