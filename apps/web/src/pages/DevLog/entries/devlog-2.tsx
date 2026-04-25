import { DevLogEntry } from '../../../components/DevLogEntry';

export const DevLogEntry2 = () => {
  return (
    <DevLogEntry
      id={2}
      title="Server Hardening + CSP Update"
      date="April 25, 2026"
      author="Andrew Steinheiser"
    >
      <p>
        I just released <code>v0.0.5</code>, which includes a few important security updates to the server, as
        well as a minor client-side prediction improvement.
      </p>
      <p>
        The CSP update is fairly minimal, but makes a big difference in smoothness. Previously, the client
        would attempt to reconcile each time it received a new message from the server. Now the client simply
        stores that server state and reconciles with it <strong>before</strong> each new tick (before new
        client-side prediction is applied). This is great because it ensures that the CSP is always applied to
        a verified server state, which means players get out of sync less often.
      </p>
      <p>
        The server changes basically boil down to tightening how inputs are processed. Previously, the server
        would process anywhere from zero to many inputs per tick. Now the server will process exactly one
        input per tick, filling the gaps with either &quot;ghost ticks&quot; or &quot;idle ticks&quot;.
      </p>
      <p>
        Practically, this means clients that are sending inputs too fast (cheating!) will end up getting
        throttled and experience some input lag (excessive speed will be rate limited). Clients that are
        sending inputs too slow (shouldn&apos;t happen using the official client) will continue to move and be
        processed at a normal rate by the server. These changes also resolve issues with clients that are no
        longer sending inputs at all (unfocused window or disconnected) by continuing to process the player
        with &quot;idle inputs&quot;, which prevents &quot;freezing&quot;.
      </p>
      <p>
        Solving netcode issues is an ever-evolving process, but I think these updates are a good step in the
        right direction!
      </p>
    </DevLogEntry>
  );
};
