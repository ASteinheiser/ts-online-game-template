import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';

const DEEP_LINK_PROTOCOL = import.meta.env.VITE_DEEP_LINK_PROTOCOL;
if (!DEEP_LINK_PROTOCOL) throw new Error('VITE_DEEP_LINK_PROTOCOL is not set');

const DESKTOP_FILE_NAME = `${DEEP_LINK_PROTOCOL}.desktop`;
const LINUX_DEEP_LINK_SCHEME = `x-scheme-handler/${DEEP_LINK_PROTOCOL}`;
const ICON_FILE_NAME = `${DEEP_LINK_PROTOCOL}.png`;

/**
 * This "installs" the app for Linux users (deep linking, app icon, etc.)
 *
 * For AppImage builds:
 *
 *  - copies the bundled game-name.desktop to ~/.local/share/applications
 *  - copies the bundled game-name.png to ~/.local/share/icons/hicolor/512x512/apps
 *  - updates the MIME database
 *  - sets game-name.desktop as the handler for x-scheme-handler/game-name
 *
 * It runs every time the app starts; existing files are simply overwritten
 */
export const registerLinuxApp = async () => {
  if (process.platform !== 'linux' || !process.env.APPIMAGE) return;

  // handle creating the desktop file (deep linking)
  const bundledDesktop = path.join(app.getAppPath(), '..', '..', DESKTOP_FILE_NAME);

  const userAppsDir = path.join(
    process.env.XDG_DATA_HOME ?? path.join(process.env.HOME!, '.local', 'share'),
    'applications'
  );

  await fs.mkdir(userAppsDir, { recursive: true });
  const targetDesktop = path.join(userAppsDir, DESKTOP_FILE_NAME);

  // handle creating the app icon
  const homeDir = path.dirname(userAppsDir);
  const userIconDir = path.join(homeDir, 'icons', 'hicolor', '512x512', 'apps');
  await fs.mkdir(userIconDir, { recursive: true });

  // use the image saved in the mounted AppImage
  const bundledIcon = path.join(
    app.getAppPath(),
    '..',
    '..',
    'usr',
    'share',
    'icons',
    'hicolor',
    '512x512',
    'apps',
    ICON_FILE_NAME
  );
  const targetIcon = path.join(userIconDir, ICON_FILE_NAME);

  await fs.copyFile(bundledIcon, targetIcon);

  // patch Exec line to point to the current AppImage, then write the desktop file
  const desktopContents = await fs.readFile(bundledDesktop, 'utf8');
  const appImagePath = process.env.APPIMAGE!;
  const patchedDesktop = desktopContents
    .replace(/^Exec=.*$/m, `Exec="${appImagePath}" %U`)
    .replace(/^Icon=.*$/m, `Icon=${targetIcon}`);
  await fs.writeFile(targetDesktop, patchedDesktop, { mode: 0o644 });

  // Rebuild the desktop MIME cache
  execFile('update-desktop-database', [userAppsDir], () => {
    // Tell xdg-mime that our desktop file handles the deep link scheme
    execFile('xdg-mime', ['default', DESKTOP_FILE_NAME, LINUX_DEEP_LINK_SCHEME]);
  });
};
