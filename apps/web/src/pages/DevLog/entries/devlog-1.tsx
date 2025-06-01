import { DevLogEntry } from '../../../components/DevLogEntry';

export const DevLogEntry1 = () => {
  return (
    <DevLogEntry
      id={1}
      title="First Steps"
      date="April 24, 2025"
      author="Andrew Steinheiser"
      content={
        <>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <img src="/logo.svg" alt="Logo" className="w-1/4 mx-auto animate-hue-rotate" />
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
        </>
      }
    />
  );
};
