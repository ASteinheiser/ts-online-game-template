import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';

const DEEP_LINK_PROTOCOL = import.meta.env.VITE_DEEP_LINK_PROTOCOL;
if (!DEEP_LINK_PROTOCOL) throw new Error('VITE_DEEP_LINK_PROTOCOL is not set');

const DESKTOP_FILE_NAME = `${DEEP_LINK_PROTOCOL}.desktop`;
const LINUX_DEEP_LINK_SCHEME = `x-scheme-handler/${DEEP_LINK_PROTOCOL}`;
const ICON_BASENAME = DEEP_LINK_PROTOCOL;

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

  // patch Exec line to point to the current AppImage
  const desktopContents = await fs.readFile(bundledDesktop, 'utf8');
  const appImagePath = process.env.APPIMAGE!;
  const patchedDesktop = desktopContents.replace(/^Exec=.*$/m, `Exec="${appImagePath}" %U`);
  await fs.writeFile(targetDesktop, patchedDesktop, { mode: 0o644 });

  // handle creating the app icons in hicolor theme
  const homeDir = path.dirname(userAppsDir);
  const iconBaseDir = path.join(homeDir, 'icons', 'hicolor');
  const sizes = ['48x48', '64x64', '128x128', '256x256', '512x512'];

  // inside AppImage only 512x512 exists
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
    `${ICON_BASENAME}.png`
  );

  for (const size of sizes) {
    const userIconDir = path.join(iconBaseDir, size, 'apps');
    await fs.mkdir(userIconDir, { recursive: true });
    const targetIcon = path.join(userIconDir, `${ICON_BASENAME}.png`);
    await fs.copyFile(bundledIcon, targetIcon);
  }

  // ensure index.theme exists so desktop environments recognize the hicolor icons
  const minimalTheme = `[Icon Theme]\nName=Hicolor\nDirectories=${sizes.map((s) => s + '/apps').join(';')}\n`;
  const targetTheme = path.join(iconBaseDir, 'index.theme');
  await fs.writeFile(targetTheme, minimalTheme);

  // Rebuild icon cache then MIME database
  execFile('gtk-update-icon-cache', [iconBaseDir], () => {
    execFile('update-desktop-database', [userAppsDir], () => {
      execFile('xdg-mime', ['default', DESKTOP_FILE_NAME, LINUX_DEEP_LINK_SCHEME]);
    });
  });
};
