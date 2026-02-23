import { DevLogEntry0 } from './entries/devlog-0';

export const DevLog = () => {
  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-5xl sm:text-7xl text-center font-pixel text-primary">Developer Log</h1>

      <DevLogEntry0 />
    </div>
  );
};
