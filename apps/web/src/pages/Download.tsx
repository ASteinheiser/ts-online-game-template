import { useState, useEffect } from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import packageJson from '../../package.json';

type OsOption = 'macos' | 'windows' | 'linux';

const detectOS = (): OsOption | undefined => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux') || userAgent.includes('x11')) return 'linux';
  return undefined;
};

export const Download = () => {
  const [os, setOs] = useState<OsOption | undefined>(detectOS());
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      if (!os) {
        setDownloadUrl(undefined);
        return;
      }

      try {
        setLoading(true);

        const repoUrl = packageJson.repository;
        const [, owner, repo] = repoUrl.match(/github.com\/(.+)\/(.+?)(\.git)?$/i) || [];
        if (!owner || !repo) {
          throw new Error('Invalid repository url in package.json');
        }

        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`);
        }

        const release = await res.json();
        const assets: Array<{ name: string; browser_download_url: string }> = release?.assets ?? [];

        const matcher: Record<OsOption, RegExp> = {
          macos: /\.dmg$/i,
          windows: /-setup\.exe$/i,
          linux: /\.AppImage$/i,
        };

        const asset = assets.find((file) => matcher[os].test(file.name));
        setDownloadUrl(asset?.browser_download_url);
      } catch (err) {
        console.error(err);
        setDownloadUrl(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRelease();
  }, [os]);

  return (
    <div className="fullscreen-center">
      <div className="flex flex-col gap-5 w-full max-w-xs mx-auto">
        <h1 className="text-5xl font-pixel text-primary text-center">Select your OS</h1>

        <div className="flex flex-col gap-4 items-center">
          <Select value={os} onValueChange={(value) => setOs(value as OsOption)}>
            <SelectTrigger className="w-[200px]" aria-label="Operating system">
              <SelectValue placeholder="Select OS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="macos">macOS</SelectItem>
              <SelectItem value="windows">Windows</SelectItem>
              <SelectItem value="linux">Linux</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild className="w-[200px]" disabled={!os || !downloadUrl} loading={loading}>
            <a href={downloadUrl}>Download</a>
          </Button>
        </div>
      </div>
    </div>
  );
};
