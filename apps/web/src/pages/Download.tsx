import { useState } from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';

type OsOption = 'macos' | 'windows' | 'linux';

export const Download = () => {
  const [os, setOs] = useState<OsOption>();

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

          <Button className="w-[200px]" disabled={!os}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
