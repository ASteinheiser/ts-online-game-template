# TypeScript Online Game Template

A _highly opinionated_ template for creating real-time, online games using [TypeScript](https://www.typescriptlang.org/)! Quickly create mmo-style games using [React](https://react.dev/) + [Phaser](https://phaser.io/) for rendering, [Colyseus](https://colyseus.io/) for websockets and [Electron](https://www.electronjs.org/) for native builds! Also has support for [Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) (PWA). Oh, and lots and lots of [Vite](https://vite.dev/) for builds and testing!

- [Overview](#overview)
- [Third-party Dependencies](#third-party-dependencies)
- [Developer Quickstart](#developer-quickstart)
- [Most Used Commands](#most-used-commands)
- [Working with the PostgreSQL DB](#working-with-the-postgresql-db)
- [Testing](#testing)
- [Load Testing](#load-testing)
- [Available Commands](#available-commands)
- [Deployment](#deployment)

## Overview

#### Comes with 3 apps:

- `desktop`: Frontend rendering for the game written in TypeScript using Electron, React, Phaser, Colyseus and GraphQL. When built, compiles an executable that runs a version of Chromium to render the game.
- `game-api`: Backend server that handles the game state and data via WebSockets and GraphQL. Written in TypeScript with Colyseus, Express and [Apollo GraphQL](https://www.apollographql.com/docs).
- `web`: Static webpage that can serve as a marketing site, devlog, roadmap, wiki etc. Written in Typescript with React and GraphQL. Could also be used to serve the Phaser/Colyseus game (with support for PWA).

#### And 5 packages:

- `core-game`: Main logic for the game. Shareable for use on the server as well as the client. Client-side prediction ([CSP](https://en.wikipedia.org/wiki/Client-side_prediction)) demo included.
- `client-auth`: Shared auth forms, hooks, etc. built with the local `ui` package. Used by both the static webpage and Electron app.
- `ui`: Shared Tailwindcss theme and Shadcn/ui components
- `typescript-config`: Shared TypeScript configs
- `eslint-config`: Shared ESlint configs

<br />
<img src="./images/dev.gif" width="800px" height="auto">

## Third-party Dependencies

This project relies on [Supabase](https://supabase.com/) for [JWT authentication](https://auth0.com/docs/secure/tokens/json-web-tokens). They offer a very generous free tier ([50k MAU](https://supabase.com/pricing)) and a straight-forward developer experience. It's also [open source](https://github.com/supabase/supabase?tab=readme-ov-file#supabase), so you can self-host if the need arises!

You'll need to create a free tier [project](https://supabase.com/dashboard/) and add the relevant keys to your local environment. Keys can be found by navigating to your [Supabase project](https://supabase.com/dashboard/), then from the sidebar, "Project Settings" > "Data API". Here you should see a few important sections: "Project URL", "Project API Keys" and "JWT Settings". **Use the values from these sections to create the following files based on the `.env.example` files:**
- `apps/desktop/.env`
- `apps/game-api/.env`
- `apps/web/.env`

**NOTE:** You'll need to update the `Site URL` (under `Authentication` > `URL Configuration`) to send email links to the auth redirect route. For example, if your custom domain is `https://ts-game.online`, you should enter: `https://ts-game.online/auth/redirect`. You can use `http://localhost:4200/auth/redirect` for local development. Configure this value here:

`https://supabase.com/dashboard/project/<PROJECT_ID>/auth/url-configuration`

I recommend also updating the `Secure email change` setting to `false` (under `Authentication` > `Providers` > `Email`). By default, Supabase sets this to `true`, which will require users to click a link in both the old and new emails. While this is a good security measure, it can be annoying if users can't access their old email for some reason.

### Env Considerations
- [Turborepo recommends](https://turborepo.com/docs/crafting-your-repository/using-environment-variables#best-practices) that you define environment variables for each "app" instead of trying to define them globally. This helps prevent sensitive env values from leaking across apps.
  - Although vite has built-in mechanisms for ensuring certain env doesn't get exposed on the frontend, I find it messy to have env from the web app loaded on the backend, for example.
- To ensure caches miss when updating env values, you may need to update the `turbo.json` section for `tasks.build.env`. It should be noted that [turborepo will infer](https://turborepo.com/docs/crafting-your-repository/using-environment-variables#framework-inference) any `VITE_`-prefixed env.
  - This means that if you add more `VITE_WHATEVER` variables to either `apps/desktop/.env` or `apps/web/.env`, then you do **NOT** need to update the `turbo.json`.
  - However, if you add another variable to `apps/game-api/.env`, then you **SHOULD** update the `build` tasks' `env` in the `turbo.json`.
  - *NOTE:* the `dev` task does not need the `env` field since it's `cache` setting is set to `false`.

### Auth Email Templates

You can also quickly customize the auth emails using the templates under `packages/client-auth/email-templates` by navigating to:

`https://supabase.com/dashboard/project/<PROJECT_ID>/auth/templates`

## Developer Quickstart

If you are familiar with `pnpm` and `docker-compose`, you can skip to [Useful Commands](#useful-commands) or quickly start development with:
```bash
pnpm i
pnpm db:start
pnpm db:sync
pnpm dev
```

When you run `dev`, you should see:
- Web page at http://localhost:4200
- Native desktop window with the game connected to ws://localhost:4204
- Colyseus playground at http://localhost:4204
- Colyseus monitor tool at http://localhost:4204/monitor
- Apollo GraphQL playground at http://localhost:4204/graphql
- PostgreSQL DB at postgresql://guest:guest@localhost:5432/game_db

#### Otherwise, you should:

Install the `docker-compose` cli, which can be [installed via Docker Desktop](https://docs.docker.com/compose/install/). Make sure you have Docker Desktop running!

<b>Ensure</b> you are using the <ins>correct version</ins> of <ins>Node.js</ins>. You can validate this by comparing your local version of node (`node -v`) with the `.nvmrc`.

NOTE: The `.nvmrc` uses an alias for the node version. I highly recommend managing your local node version with [`nvm`](https://github.com/nvm-sh/nvm). This will allow you to quickly swap to the correct version with:
```
nvm use
```

This project uses [`pnpm`](https://pnpm.io/) for it's dependency mangement. You can install it with `npm`:
```
npm i -g pnpm
```

This project also uses [Turborepo](https://turborepo.com/) to manage scripts across the monorepo. While this is NOT necessary, [it is recommended](https://turborepo.com/docs/getting-started/installation#installing-turbo) that you install a local version:
```
npm i -g turbo
```

With the `turbo` cli, you can take a look at the project structure as well as the available commands:
```
turbo ls
turbo run
```

## Most Used Commands

These commands are available from the root directory whether you decide to install the `turbo` cli locally or not...

<b>NOTE</b>: Commands should <ins>almost always</ins> be ran from the root directory. The package manager, `pnpm`, uses `turbo` to manage and run scripts. Since code can be shared between repos, `turbo` helps ensure that scripts run in a certain order when necessary.

| Command | Description |
|---------|-------------|
| `pnpm db:[start\|stop\|sync]` | Uses `docker-compose` and `prisma` to manage a local PostgreSQL DB |
| `pnpm dev` | Run local development servers for each app |
| `pnpm db:test:[start\|stop\|sync]` | Uses `docker-compose` and `prisma` to manage a test PostgreSQL DB |
| `pnpm test` | Runs the typecheck, linter and tests for each repo |
| `pnpm test:watch` | Runs the test suite in each repo and watches for changes |
| `pnpm test:load` | Builds and runs the `game-api` then starts the load test |
| `pnpm preview` | Builds each app and runs a local server using the output |
| `pnpm build:[win\|mac\|linux]` | Builds the desktop app via Electron |

<b>NOTE</b>: If, for example, your Electron app is throwing an error when starting or building, but was previously working, try:
```
pnpm install:clean
```

## Working with the PostgreSQL DB

If this is your first time running the project, you'll need to start the DB with `docker-compose` and sync the tables with `prisma`:
```
pnpm db:start
pnpm db:sync
```

`pnpm generate:db-types` will run during `dev`, `build`, etc., if you're using the monorepo commands.

However, if you change the DB schema via `apps/game-api/prisma/schema.prisma`, then you'll need to run `db:sync` again:
```
pnpm db:sync
```

This will generate a SQL migration, migrate your local DB, and update your types.

<b>NOTE</b>: This project uses Turborepo's Terminal UI ([tui](https://turborepo.com/blog/turbo-2-0#new-terminal-ui)) and some tasks are interactive, such as `test:watch` and `db:sync`. When you want to interact with a window, press "i", then interact as normal. Press "ctrl" + "z" to leave interactive mode.

## Testing

When you run `pnpm test` or `pnpm test:watch`, it will run the `game-api` test suite, which requires a local test DB to be running. This can be accomplished by following the instructions for [working with the PostgreSQL DB](#working-with-the-postgresql-db), with the only difference being that you add `test:` to the `db:` commands, ie:
```
pnpm db:test:start
pnpm db:test:sync
pnpm db:test:stop
```

<b>NOTE</b>: `pnpm test:watch` offers a similar experience to `pnpm dev`, in the sense that it will watch for graphql and prisma type changes, and hot-reload as needed. `pnpm test` acts as a complete CI check as it will run all the type generators, typechecks, linters, then finally tests.

<br />
<img src="./images/test.gif" width="800px" height="auto">

## Load Testing

Colyseus has a built-in load testing tool that can be used to test the scalability of the game rooms. The example load test is located in `apps/game-api/test/load/test.ts`. To start the load test, run:
```
pnpm test:load
```

<b>NOTE</b>: This will run the `game-api` CI checks, start the server in preview mode, then run the load test. The preview server is production-like, but pointed at a local test DB. Please ensure the test DB is running and synced, same as the [testing instructions](#testing) above:
```
pnpm db:test:start
pnpm db:test:sync
```

<br />
<img src="./images/test-load.gif" width="800px" height="auto">

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Installs dependencies for each repo |
| `pnpm install:clean` | Runs a script to clear builds, caches, deps, etc., then runs install |
| `pnpm test` | Runs the typecheck, linter and tests for each repo |
| `pnpm test:watch` | Runs the test suite in each repo and watches for changes |
| `pnpm test:load` | Builds and runs the `game-api` then starts the load test |
| `pnpm lint` | Runs the code linting check in each repo |
| `pnpm lint:fix` | Runs the linter and fixes code when possible |
| `pnpm check-types` | Runs the typescript check in each repo |
| `pnpm generate:gql-types` | Generates the GraphQL types in each repo |
| `pnpm generate:gql-types:watch` | Generates the GraphQL types and watches each repo  |
| `pnpm generate:db-types` | Generates DB types via `prisma.schema` |
| `pnpm generate:db-types:watch` | Generates DB types via `prisma.schema` and watches for changes |
| `pnpm db:start` | Uses `docker-compose` to start a local PostgreSQL DB |
| `pnpm db:stop` | Uses `docker-compose` to stop the local PostgreSQL DB |
| `pnpm db:sync` | Uses `prisma` to manage the local DB based on the `schema.prisma` |
| `pnpm db:test:start` | Uses `docker-compose` to start a local PostgreSQL DB for testing |
| `pnpm db:test:stop` | Uses `docker-compose` to stop the local PostgreSQL DB for testing |
| `pnpm db:test:sync` | Uses `prisma` to manage the testing DB based on the `schema.prisma` |
| `pnpm dev` | Run local development servers for each app |
| `pnpm generate:app-icons` | Generates PWA/Electron icons from `apps/web/public/logo.svg` |
| `pnpm generate:pwa-assets` | Generates PWA assets from `apps/web/public/logo.svg` |
| `pnpm build` | Generates icons and builds each app including sub-repos |
| `pnpm preview` | Builds each app and runs a local server using the output |
| `pnpm build:win` | Builds the desktop app (via Electron) for Windows |
| `pnpm build:mac` | Builds the desktop app (via Electron) for MacOS |
| `pnpm build:linux` | Builds the desktop app (via Electron) for Linux |

## Deployment

#### Architecture overview:

<img src="./images/infra-diagram.png" width="800px" height="auto">

### Web Hosting Setup

The web hosting setup is based on GitHub Pages and GitHub Actions. To get started:

Go to your github repository, then `Settings` > `Pages`, select `Source` and choose `GitHub Actions`.

> You can also add a custom domain via the `Custom domain` field. Make sure you follow the instructions to ensure you have the correct DNS records in place. Also ensure you select `Enforce HTTPS` and update the `/apps/web/public/CNAME` file with your custom domain.

Now go to `Secrets and variables` > `Actions`, then fill out the `Environment secrets` section according to your `/apps/web/.env` file.

### Desktop File Hosting Setup

TODO: hosting via github releases

### Auth Setup

You should already have a Supabase project setup with JWT auth. So that piece is covered!

### Database Setup

Supabase offers a hosted PostgreSQL DB at no cost (limited storage/CPU). You can choose any other provider you'd like, and depending on your needs, you may want to compare pricing with [DigitalOcean](https://www.digitalocean.com/products/managed-databases-postgresql/) or [AWS RDS](https://aws.amazon.com/rds/postgresql/) at actual scale. But for a small project, Supabase is a great option.

Follow [these instructions](https://supabase.com/docs/guides/database/prisma) to setup a hosted PostgreSQL DB with Supabase for Prisma. You'll need to setup your Prisma user in Supabase and turn off the Supabase Data API setting.

TODO: update env

### Game Server Setup

TODO: create DigitalOcean Droplet

TODO: update env
