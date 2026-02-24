import { DevLogEntry } from '../../../components/DevLogEntry';

export const DevLogEntry1 = () => {
  return (
    <DevLogEntry id={1} title="Demo Cleanup" date="February 23, 2026" author="Andrew Steinheiser">
      <p>
        My goal with <code>v0.0.2</code> was to clean up the main client <code>Scene</code> and server{' '}
        <code>Room</code> files. You should be able to jump right into setting up whatever{' '}
        <code>Systems</code> you want now! I&apos;m starting to think that, even if you were going to set up
        an ECS, you&apos;ll most likely still want some of the basic <code>Systems</code> in this template.
        These handle things like room management, authentication, player input, etc.
      </p>
      <p>
        The demo now features interpolated movement for the &quot;enemy&quot; entities as well as
        &quot;local&quot; and &quot;remote&quot; player entities. This looks smooth across different FPS
        limits (60fps vs 120fps). I also added a simple FPS display so you can monitor that in real-time. For
        example, I noticed that my external monitors will cap the client at 60fps while my MacBook Pro&apos;s
        display will run at 120fps. That quirk combined with Phaser&apos;s built-in way to limit FPS was very
        useful for testing.
      </p>
      <p>
        I hope the update makes it easier to understand the client and server code, and get started with your
        online game dev journey!
      </p>
    </DevLogEntry>
  );
};
