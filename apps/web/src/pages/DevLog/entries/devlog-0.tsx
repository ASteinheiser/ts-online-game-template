import { Link } from 'react-router-dom';
import { DevLogEntry } from '../../../components/DevLogEntry';

export const DevLogEntry0 = () => {
  return (
    <DevLogEntry id={0} title="The Vision" date="February 22, 2026" author="Andrew Steinheiser">
      <p>
        So initially, I was going to leave this DevLog section on the template blank (<i>lorem ipsum</i>{' '}
        placeholder), but I decided I might as well write a little about what&apos;s going on with this
        project.
      </p>
      <p>
        My goal is to create a template that makes it easy to make real-time, online games using TypeScript!
        I&apos;ll be using the template myself{' '}
        <Link to="https://ore-rush.online" target="_blank" className="text-primary underline">
          to make a game
        </Link>
        , and hope others might find it useful as well! I figure the more people using a similar setup will
        lead to more information being shared, advancements made, etc.
      </p>
      <p>
        Here is a <i>rough</i> list of my motivations and goals for this template:
      </p>
      <ul className="list-disc pl-10 space-y-3 marker:content-['➤___']">
        <li>
          Create a desktop app (the game client), game server, and marketing site (with developer log,
          download button and auth)
        </li>
        <li>
          Do it all in a monorepo so you can easily share UI, game logic, or anything really across
          <code>apps</code>
        </li>
        <li>
          Create a more robust Phaser + Colyseus starter, which includes a &quot;Client Side Prediction and
          Server Reconciliation&quot; demo. All game logic is run on the server, so clients simply send their
          input (basic anti-cheat setup).
        </li>
        <li>
          Clean slate to make whatever kind of game; which means you will need to BYOS (bring your own
          systems), such as <code>miniplex</code> (ECS), etc. Make a classic mmorpg or maybe a card game!
          Whatever you want!
        </li>
        <li>
          Complete CI/CD flow that allows you to deploy and test your game live from day 1, with instructions
          on how to set it all up
        </li>
        <li>Keep the hosting costs low, especially at the start</li>
        <li>
          Test suites setup for each <code>app</code> and <code>package</code> in the monorepo
        </li>
        <li>
          Ensure fewer UI/visual bugs by leaning on Electron; all game clients will be running Chromium and
          built for Windows, macOS and Linux
        </li>
        <li>
          Ensure a consistent auth experience for users across the marketing site and desktop app (including
          deep links). Currently, I use Supabase, but you could easily swap it out in the{' '}
          <code>client-auth</code> package.
        </li>
      </ul>
    </DevLogEntry>
  );
};
