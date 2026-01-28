# TypeScript Online Game Template

A _highly opinionated_ template for creating real-time, online games using [TypeScript](https://www.typescriptlang.org/)! Quickly create mmo-style games using [React](https://react.dev/) + [Phaser](https://phaser.io/) for rendering, [Colyseus](https://colyseus.io/) for websockets and [Electron](https://www.electronjs.org/) for native builds! Also has support for [Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) (PWA). Oh, and lots and lots of [Vite](https://vite.dev/) for builds and testing!

Try the demo: https://ts-game.online/download

- [Overview](#overview)
- [Third-party Dependencies](#third-party-dependencies)
- [Developer Quickstart](#developer-quickstart)
- [Most Used Commands](#most-used-commands)
- [Local PostgreSQL DB](#local-postgresql-db)
- [Testing](#testing)
- [Load Testing](#load-testing)
- [Production Load Testing](#production-load-testing)
- [Available Commands](#available-commands)
- [Deployment Setup](#deployment-setup)
- [Deploys, Releases and Tags](#deploys-releases-and-tags)
- [Cost Breakdown](#cost-breakdown)

## Overview

#### Comes with 3 apps:

- `desktop`/`demo-game`: Frontend rendering for the game written in TypeScript using Electron, React, Phaser, Colyseus and GraphQL. When built, compiles an executable that runs a version of Chromium to render the game.
- `game-api`: Backend server that handles the game state and data via WebSockets and GraphQL. Written in TypeScript with Colyseus, Express and [Apollo GraphQL](https://www.apollographql.com/docs).
- `web`: Static webpage that can serve as a marketing site, devlog, roadmap, wiki etc. Written in Typescript with React and GraphQL. Could also be used to serve the Phaser/Colyseus game (with support for PWA).

#### And 5 packages:

- `core-game`: Main logic for the game. Shareable for use on the server as well as the client. Client-side prediction ([CSP](https://en.wikipedia.org/wiki/Client-side_prediction)) demo included.
- `client-auth`: Shared auth forms, hooks, etc. built with the local `ui` package. Used by both the static webpage and Electron app.
- `ui`: Shared Tailwindcss theme and Shadcn/ui components
- `typescript-config`: Shared TypeScript configs
- `eslint-config`: Shared ESlint configs

<br />
<img src="./images/dev-demo.gif" width="800px" height="auto">

## Third-party Dependencies

This project relies on [Supabase](https://supabase.com/) for [JWT authentication](https://auth0.com/docs/secure/tokens/json-web-tokens). They offer a very generous free tier ([50k MAU](https://supabase.com/pricing)) and a straight-forward developer experience. It's also [open source](https://github.com/supabase/supabase?tab=readme-ov-file#supabase), so you can self-host if the need arises!

You'll need to create a free tier [project](https://supabase.com/dashboard/) and add the relevant keys to your local environment. Keys can be found by navigating to your [Supabase project](https://supabase.com/dashboard/), then from the sidebar, "Project Settings" > "Data API". Here you should see a few important sections: "Project URL", "Project API Keys" and "JWT Settings". **Use the values from these sections to create the following files based on the `.env.example` files:**
- `apps/desktop/.env`
- `apps/game-api/.env`
- `apps/web/.env`

**NOTE:** You'll need to add `Redirect URLs` (under `Authentication` > `URL Configuration`) to send email links to the auth redirect route. For example, if your custom domain is `https://ts-game.online`, you should add: `https://ts-game.online/auth/redirect*`. You can also add `http://localhost:4200/auth/redirect*` for local development. Configure this here:

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
```bash
nvm use
```

This project uses [`pnpm`](https://pnpm.io/) for it's dependency mangement. You can install it with `npm`:
```bash
npm i -g pnpm
```

This project also uses [Turborepo](https://turborepo.com/) to manage scripts across the monorepo. While this is NOT necessary, [it is recommended](https://turborepo.com/docs/getting-started/installation#installing-turbo) that you install a local version:
```bash
npm i -g turbo
```

With the `turbo` cli, you can take a look at the project structure as well as the available commands:
```bash
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
```bash
pnpm install:clean
```

## Local PostgreSQL DB

If this is your first time running the project, you'll need to start the DB with `docker-compose` and sync the tables with `prisma`:
```bash
pnpm db:start
pnpm db:sync
```

`pnpm generate:db-types` will run during `dev`, `build`, etc., if you're using the monorepo commands.

However, if you change the DB schema via `apps/game-api/prisma/schema.prisma`, then you'll need to run `db:sync` again:
```bash
pnpm db:sync
```

This will generate a SQL migration, migrate your local DB, and update your types.

<b>NOTE</b>: This project uses Turborepo's Terminal UI ([tui](https://turborepo.com/blog/turbo-2-0#new-terminal-ui)) and some tasks are interactive, such as `test:watch` and `db:sync`. When you want to interact with a window, press "i", then interact as normal. Press "ctrl" + "z" to leave interactive mode.

## Testing

When you run `pnpm test` or `pnpm test:watch`, it will run the `game-api` test suite, which requires a local test DB to be running. This can be accomplished by following the instructions for [working with the PostgreSQL DB](#working-with-the-postgresql-db), with the only difference being that you add `test:` to the `db:` commands, ie:
```bash
pnpm db:test:start
pnpm db:test:sync
pnpm db:test:stop
```

<b>NOTE</b>: `pnpm test:watch` offers a similar experience to `pnpm dev`, in the sense that it will watch for graphql and prisma type changes, and hot-reload as needed. `pnpm test` acts as a complete CI check as it will run all the type generators, typechecks, linters, then finally tests.

<br />
<img src="./images/test.gif" width="800px" height="auto">

## Load Testing

Colyseus has a built-in load testing tool that can be used to test the scalability of the game rooms. The example load test is located in `apps/game-api/test/load/test.ts`. To start the load test, run:
```bash
pnpm test:load
```

<b>NOTE</b>: This will run the `game-api` CI checks, start the server in preview mode, then run the load test. The preview server is production-like, but pointed at a local test DB. Please ensure the test DB is running and synced, same as the [testing instructions](#testing) above:
```bash
pnpm db:test:start
pnpm db:test:sync
```

<br />
<img src="./images/test-load.gif" width="800px" height="auto">

## Production Load Testing

**WARNING:** This is a **VERY** powerful tool used to test the scalability of your api server/game rooms. Keep in mind that you can impact users if you run this against your production server. At the start, running against prod is fine, however, once you have actual users, you should consider running this against a staging server.

When running the prod load test, you won't be able to seed your DB automatically, unlike the local version. In both local and prod load tests, you'll use the prod `JWT_SECRET` (present in the local `.env`) to create test tokens. These tokens will be used by the server to find a user in the DB, using the decoded `id`. These users will not be created in the prod DB automatically. To quickly solve this issue, I recommend uploading a CSV with test user data via your Supabase Dashboard. A CSV with 200 test users can be found in: `apps/game-api/test/load/prod-test-users.csv`

Once you have test users in the prod DB, you can run the load test against your production server:
```bash
pnpm test:load:prod
```

**NOTE:** While running the prod load test, you should monitor the server's CPU and memory usage. I like to watch the DigitalOcean Droplet's graphs to see total server resources used:
```
cloud.digitalocean.com/droplets/<DROPLET_ID>/graphs
```
I also like to SSH into the server to see current usage and logs:
```bash
ssh deployer@api.ts-game.online
pm2 monit
```

### Results Snapshot

This snapshot was created on `2026-01-27`. All tests were run for 3 minutes against the cheapest DigitalOcean Droplet:
- 512MB RAM
- 1 vCPU
- 10GB SSD
- Ubuntu 24.04 LTS
- US West - San Francisco

| Room Size | Players | CPU Peak | Memory Peak |
|---------|-----------|----------|-------------|
| - | - (idle) | < 1% | 65% (77 mb) |
| - | - (idle `pm2 monit`) | 3% | 75% (77 mb) |
| 4 | 4 | 7% | 75% (102 mb) |
| 4 | 40 | 35% | 79% (106 mb) |
| 4 | 100 | 61% | 85% (114 mb) |
| 4 | 200 | 88% | 90% (111 mb) |
| 10 | 10 | 10% | 78% (101 mb) |
| 10 | 100 | 51% | 84% (109 mb) |
| 10 | 200 | 80% | 90% (115 mb) |
| 25 | 25 | 18% | 73% (117 mb) |
| 25 | 100 | 49% | 77% (118 mb) |
| 25 | 200 | 66% | 84% (122 mb) |
| 50 | 50 | 23% | 77% (121 mb) |
| 50 | 100 | 38% | 81% (127 mb) |
| 50 | 200 | 61% | 82% (113 mb) |
| 100 | 100 (overflows at ~80) | 39% | 78% (130 mb) |

**NOTE:** The CPU and memory usage percentages are relative to the Droplet's total resources (from the DigitalOcean graphs). The memory usage for the `game-api` server alone is shown in parenthesis (from the `pm2 monit` output).

### Learnings

It appears to be more efficient on the server to have larger rooms, but at a certain size, you will get buffer overflows. This is due to the sheer size of the room state (many players, each with their own state). You should try to strike a balance between room size and state. The smaller you can make the room state, the more players you can support in a single room. Conversely, if you have a lot of state to track, you will need to limit your maximum room size accordingly.

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Installs dependencies for each repo |
| `pnpm install:clean` | Runs a script to clear builds, caches, deps, etc., then runs install |
| `pnpm test` | Runs the typecheck, linter and tests for each repo |
| `pnpm test:watch` | Runs the test suite in each repo and watches for changes |
| `pnpm test:load` | Builds and runs the `game-api` then starts the load test |
| `pnpm test:load:prod` | Runs the load test script pointed at the production server |
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
| `pnpm db:deploy` | Uses `prisma` to deploy migrations to the prod DB (used by CI) |
| `pnpm dev` | Run local development servers for each app |
| `pnpm generate:app-icons` | Generates PWA/Electron icons from `apps/web/public/logo.svg` |
| `pnpm generate:pwa-assets` | Generates PWA assets from `apps/web/public/logo.svg` |
| `pnpm build` | Generates icons and builds each app including sub-repos |
| `pnpm preview` | Builds each app and runs a local server using the output |
| `pnpm build:win` | Builds the desktop app (via Electron) for Windows |
| `pnpm build:mac` | Builds the desktop app (via Electron) for MacOS |
| `pnpm build:linux` | Builds the desktop app (via Electron) for Linux |

## Deployment Setup

#### Architecture overview:

<img src="./images/system-design.png" width="800px" height="auto">

### Web Hosting Setup

The web app is built by GitHub Actions and hosted via GitHub Pages. To get started:

Go to your github repository, then `Settings` > `Pages`, select `Source` and choose `GitHub Actions`.

> You can also add a custom domain via the `Custom domain` field. Make sure you follow the instructions to ensure you have the correct DNS records in place. Also ensure you select `Enforce HTTPS` and update the `/apps/web/public/CNAME` file with your custom domain.

Now go to `Settings` > `Environments`, then select (or create if needed) the `github-pages` environment. Fill out the `Environment secrets` section according to your `/apps/web/.env` file.

**NOTE:** Before hosting the `game-api`, you won't have a valid `VITE_API_URL`. So for now, just use the development value: `http://localhost:4204`

Now that everything is setup, you can either push to `main` or manually trigger the `Deploy Web to GitHub Pages` workflow from the `Actions` tab.

### Desktop File Hosting Setup

The desktop app files are built by GitHub Actions, signed (macOS/Windows) and hosted via GitHub Releases. To get started:

Go to your github repository, then `Settings` > `Environments` and create the `github-releases` environment. Fill out the `Environment secrets` section according to your `/apps/desktop/.env` file.

**NOTE:** Before hosting the `game-api`, you won't have a valid `VITE_API_URL` or `VITE_WEBSOCKET_URL`. So for now, just use the development values: `http://localhost:4204` and `ws://localhost:4204` respectively.

**NOTE:** You will also need to set the `GH_TOKEN` environment secret. This is used to authenticate with the GitHub API and update the release with the desktop app files as they are built. [Generate a personal access token](https://github.com/settings/personal-access-tokens) and make sure to give it permissions to `read and write` on `Contents`.

#### macOS Signing

To sign and notarize builds for macOS, you'll need:
- a MacBook (Keychain Access app required)
- an [Apple Developer account](https://developer.apple.com/)
- to be enrolled in the paid [Apple Developer Program](https://developer.apple.com/programs/enroll/)

You'll also need to set the following:

| Environment Secret | Description |
|----|----|
| `APPLE_ID` | Email address of the Apple Developer account |
| `APPLE_APP_SPECIFIC_PASSWORD` | Generated "App-Specific Password" (16 characters) |
| `APPLE_TEAM_ID` | Team ID of the Apple Developer account (10 characters) |
| `MAC_CERT_B64` | Base64 encoded "Developer ID Application" certificate |
| `MAC_CERT_PASS` | Password for the certificate |

Setting your `APPLE_ID` should be easy, just use your email address that you'll use to log in at https://account.apple.com/. Once you log in, under "Sign-In and Security", you should see a section called "App-Specific Passwords". Create a new password and copy the value (this only shows once, 16 characters, ex: `asdf-asdf-asdf-asdf`). Now use that value to set the `APPLE_APP_SPECIFIC_PASSWORD` environment secret.

To find your `APPLE_TEAM_ID`, go to https://developer.apple.com/account and scroll down to "Membership details". You should see your 10 character "Team ID" here (ex: `1234ABCD56`).

Getting a valid `MAC_CERT_B64` (and `MAC_CERT_PASS`) is a bit more involved. You'll need a "Developer ID Application" certificate (a `.p12` file) that you can base64 encode. Before you can create that certificate, you'll need to create a "Certificate Signing Request" (CSR) file. This can be done with Keychain Access:
- Open Keychain Access
- Click "Keychain Access" > "Certificate Assistant" > "Request a Certificate from a Certificate Authority"
- Create a CSR with:
    - your Apple Developer email as the User Email Address
    - Common Name set to your name or company name
    - empty CA Email Address
    - "Request is" set to "Saved to disk"
- Save the CSR file (`.certSigningRequest` file)

Now you can create the "Developer ID Application" certificate (and `.p12` file) from https://developer.apple.com/account/resources/certificates/list
- Create a new Certificate
- Select "Developer ID Application" and click "Continue"
- DO NOT CHANGE the default selection for "Previous Sub-CA"
- Upload the CSR file you just created
- Create the Certificate
- Download the certificate (should be a `.cer` file)
- Double click the `.cer` file to add it to your Keychain
- Ensure that you see a checkmark with "This certificate is valid", otherwise, revisit the steps above
- Expand the certificate, select the cert and the private key, then click "Export 2 items..."
- Ensure you save it as a `.p12` format
- As you save this file, you'll be prompted to enter a password for the certificate. This is the `MAC_CERT_PASS` that you'll need to set as a environment secret. I recommend using a password manager to generate a secure password.

You should now have a valid `.p12` file. You can base64 encode it, then copy the value, by running:
```bash
base64 < ~/path/to/cert_name.p12 | pbcopy
```

Finally, set the `MAC_CERT_B64` environment secret with the base64 encoded value (you can paste it directly from your clipboard).

#### Windows Signing

To sign builds for Windows, you'll need an Azure ["Artifact Signing Account"](https://azure.microsoft.com/en-us/products/artifact-signing), which is a hosted Certificate Authority service. This works similarly to the Apple Developer program and has similar pricing as well. To get started:
- Create/log in to your Azure account
- From the Azure Dashboard, search for "Artifact Signing Accounts"
- Create a new Artifact Signing Account
- After creating the account, you'll need to give the Artifact Signing Account permissions to perform Identity Verification. This can be done by selecting the Account, then going to "Access Control (IAM)" and adding the role assigment for "Artifact Signing Identity Verifier" to your user.
- Now go back to the Artifact Signing Account, and click on "Identity validation", select "Individual" (instead of "Organization"), then "New Identity" > "Public"
- Fill out the form with your information, create your new identity and wait for processing
- You will most likely see the status update to "Action Required". If you do, click on the Identity and you should see a link (ex: "Please complete your verification here")
- Complete the verification process, which will likely include uploading your ID and a selfie through a verification portal, as well as downloading the Microsoft Authenticator app
- You should now see your Individual Identity with a status of "Completed"
- Now go back to the Artifact Signing Account, and click on "Certificate profile"
- Click "Create" > "Public Trust"
- Fill out the form, selecting your new Individual Identity from the dropdown for "Verified CN and O", then create the profile

With a valid "Certificate Profile", you can now fill out your Azure signing information in the `/apps/desktop/electron-builder.yml` file:
```yaml
win:
  azureSignOptions:
    endpoint: "<YOUR_ARTIFACT_SIGNING_ACCOUNT_URI>"
    codeSigningAccountName: "<YOUR_ARTIFACT_SIGNING_ACCOUNT_NAME>"
    certificateProfileName: "<YOUR_CERTIFICATE_PROFILE_NAME>"
    publisherName: "<YOUR_CERTIFICATE_SUBJECT>"
```

Now you need to create the "App registration" in Azure:
- From the Azure Dashboard, search for "App registrations"
- Click "New registration"
- Give it a name like `gh-electron-signer` and create
- From your new App Registration, you should be able to see two fields:
    - "Application (client) ID" > set this as the `AZURE_CLIENT_ID` environment secret
    - "Directory (tenant) ID" > set this as the `AZURE_TENANT_ID` environment secret
- Now click on "Manage" > "Certificates & secrets"
- Click "New client secret" and create a new secret
- Ensure you copy the Value, as it will only show once!
- Set the `AZURE_CLIENT_SECRET` environment secret with the value you just copied

This final step is very important... You need to assign "Artifact Signing Certificate Profile Signer" permissions to your "App Registration":
- From your "Artifact Signing Account", click on "Access Control (IAM)"
- Click "Add" > "Add role assignment"
- Find and select the "Artifact Signing Certificate Profile Signer" role
- For "Members", you need to assign a "service principal" for your "App Registration"
- Click "Select members" and search for your "App Registration" by name
- Create the permission
- Double check the new permission in "Artifact Signing Account" > "Access Control (IAM)" > "Role assignments" tab

#### Deployment Trigger

The desktop app files can now be built, signed (macOS/Windows) and hosted in a GitHub Release! Simply create a Release with a new Tag that looks like `v*.*.*`, and the GitHub Action will kick off the build process for each OS. As each OS build completes, the Release will be updated with the desktop app files.

#### Automatic Updates

On all platforms (macOS/Windows/Linux), the app will automatically check for updates and download them in the background. This is possible thanks to `electron-builder`'s `publish` feature combined with `electron-updater`. When an update is found, the app will display a modal and toast to the user, then restart the app once the download completes. Session rejoin logic is implemented, so this setup should result in all users being on the latest version of the app at all times, while experiencing minimal interruption.

### Auth Setup

You should already have a Supabase project setup with JWT auth. So that piece is covered!

### Database Setup

Supabase offers a hosted PostgreSQL DB at no cost (limited storage/CPU). You can choose any other provider you'd like, and depending on your needs, you may want to compare pricing with [DigitalOcean](https://www.digitalocean.com/products/managed-databases-postgresql/) or [AWS RDS](https://aws.amazon.com/rds/postgresql/) at actual scale. But for a small project, Supabase is a great option.

Follow [these instructions](https://supabase.com/docs/guides/database/prisma) to setup a hosted PostgreSQL DB with Supabase for Prisma. You'll need to:
- Turn off the Supabase Data API setting
  - this is a security measure since you will connect to the DB directly via connection string
- Create your Prisma user in Supabase
- Obtain your connection string
  - Example: `postgres://prisma.[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres`
- Go to your GitHub repository, then `Settings` > `Environments`, and create the `game-server` environment
- Add a new environment secret called `DATABASE_URL` and set it to your connection string

Now your production DB is set up. Each time you create a new Tag that looks like `api-v*.*.*`, the GitHub Action will kick off a backend deployment. One step of this deployment will handle migrating the DB according to your Prisma migrations.

**NOTE:** When creating a new Tag for a backend deployment, DO NOT create a Release! Releases are reserved for hosting the desktop app files only...

### Game Server Setup

To host your game server as quickly and cheaply as possible, I recommend using [DigitalOcean Droplets](https://www.digitalocean.com/products/droplets/). Their cheapest server is ~$4/month and deployment to it can be easily automated with GitHub Actions (after one-time setup). As you scale, you may want to evaluate pricing against other hosting providers, such as [AWS EC2](https://aws.amazon.com/ec2/) or [GCP Compute Engine](https://cloud.google.com/compute).

To get started, first go to your github repository, then `Settings` > `Environments` and select the `game-server` environment. This env should already have the `DATABASE_URL` secret from the DB setup steps above. Fill out the remaining `Environment secrets` based on your `/apps/game-api/.env` file.

Now you need to create a DigitalOcean Droplet:
- Create/log in to your DigitalOcean account
- Create a new Droplet
  - Select a region near you/your users
  - Select "Ubuntu 24.04 LTS"
  - Choose the cheapest server (should be ~$4/mo)
  - Select "SSH Key for Authentication Method"
    - Follow the instructions to generate and add an SSH key
  - Select "Add improved metrics monitoring and alerting (free)"
    - This will give you some helpful insight as you scale up
  - Create the Droplet
- Copy the Droplet's public IP address (IPv4)
  - If you want to use your custom domain for your API server, you can use this value to create a DNS record in your domain registrar
    - Create an "A record" for `api.domain.com` pointed to the Droplet's IPv4
  - Either the Droplet's IP or your custom domain can be used to create production `VITE_API_URL` and `VITE_WEBSOCKET_URL` environment secrets
    - Make sure you use secure protocols for production URLs
    - ex: `wss://api.domain.com` or `https://123.123.123.123`

Now that you have a Droplet online, you can SSH into it for first time setup:
```bash
ssh root@<DROPLET_IP>
```

Once you are logged in to the Droplet, you should setup the `deployer` user and create firewall rules:
```bash
adduser deployer --disabled-password
usermod -aG sudo deployer

ufw allow OpenSSH
ufw allow 80,443/tcp
ufw enable
```

Copy the SSH key from the `root` user to the `deployer`, then switch to the `deployer` user:
```bash
sudo -u deployer mkdir -p /home/deployer/.ssh
sudo chown deployer:deployer /home/deployer/.ssh
sudo chmod 700 /home/deployer/.ssh

sudo cat /root/.ssh/authorized_keys \
  | sudo -u deployer tee -a /home/deployer/.ssh/authorized_keys >/dev/null

sudo chown deployer:deployer /home/deployer/.ssh/authorized_keys
sudo chmod 600 /home/deployer/.ssh/authorized_keys

su - deployer
```

**IMPORTANT:** On Ubuntu 24.04, you need to comment out the lines in your `~/.bashrc` file following the comment: `# If not running interactively, don't do anything`. These lines will prevent you from calling `pm2` from the GitHub Action (SSH non-interactive mode). Since you will only be using `deployer` to SSH during the deployment process, you do not need to update `root`'s `~/.bashrc` file. Your `deployer` user's `~/.bashrc` file should look like this:
```bash
...
# If not running interactively, don't do anything
#case $- in
#    *i*) ;;
#      *) return;;
#esac
...
```

Install `nvm`, `node` and `pm2`:
```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.nvm/nvm.sh
# Make sure this matches the version in the .nvmrc file
nvm install 24
npm install -g pm2
```

Ensure `pm2` resurrects on boot:
```bash
pm2 startup systemd -u deployer --hp /home/deployer
```

**NOTE:** This will output a command which you will need to run as `sudo`. Switch back to the `root` user (`exit`) and run the command. Once the command completes, you need to switch back to the `deployer` user.

Setup `pm2-logrotate`, which will help with the limited server resources by rotating and cleaning up `pm2` logs:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 save --force
```

The final step for setting up the Droplet is to install `caddy`, which will be used as a reverse proxy (with automatic TLS) for the game API server. Before continuing, you will need to switch back to the `root` user:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl caddy
# Make sure to replace the two placeholders with actual values
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
<YOUR_CUSTOM_DOMAIN_OR_DROPLET_IP> {
    reverse_proxy localhost:<PORT_ENV_SECRET>
    encode gzip
    log {
      output file /var/log/caddy/game-api_access.log
    }
}
EOF
# Reload Caddy to apply the new configuration
sudo systemctl reload caddy
```

**NOTE:** If you need to see production logs, you can always SSH into the Droplet and run:
```bash
# List all running PM2 processes
pm2 list
# View the logs for the game-api server
pm2 logs game-api --lines 200
# Clear out logs manually
pm2 flush
# Show verbose info about the game-api process
pm2 show game-api
# Monitor the game-api process (CPU/Memory usage and logs)
pm2 monit
```

For the GitHub Action to properly deploy the backend, you'll need to create three more environment secrets in `game-server`:
| Environment Secret | Description |
|----|----|
| `DROPLET_IP` | The IPv4 address of the Droplet |
| `DROPLET_SSH_KEY` | The private SSH key string (`pbcopy < ~/.ssh/key`) |
| `DROPLET_SSH_PASS` | The password to use with the SSH key |

Now your Droplet is ready to host the game API server! 

#### Deployment Trigger

Whenever you create a new Tag that looks like `api-v*.*.*`, the GitHub Action will kick off a backend deployment. First, this will handle migrating the DB according to your Prisma migrations, then it will update and restart the game API server in DigitalOcean.

**NOTE:** When creating a new API Tag, DO NOT create a Release! Releases are reserved for hosting the desktop app files only...

## Deploys, Releases and Tags

Each app in the monorepo is deployed using GitHub Actions, however, they all have different trigger mechanisms.

**NOTE:** If you just finished the "Deployment Setup" section above, you might have your `web` and `desktop` apps deployed, but they'll be missing the proper environment secrets for the production game server. You can resolve this by first updating the environment secrets for both apps (`VITE_API_URL` and `VITE_WEBSOCKET_URL`), then triggering new deployments.

### Web Deploy
Simply push to the `main` branch or manually trigger the `Deploy Web to GitHub Pages` workflow from the Actions tab in GitHub. The automated workflow is looking for any changes to `apps/web/`, as well as `packages/`.

### Desktop Deploy
To build and host the desktop app files, create a Release with a new Tag (or just push a new Tag), that looks like `v*.*.*`. You can do this through the GitHub UI, by clicking on "Releases" > "Draft a new release". The GitHub Release will be updated with the desktop app files as they are built.

**NOTE:** It's very important that the "Releases" are reserved for hosting the desktop app files only. The native app updates and download button on web depend on this.

If you want to delete a Release and Tag, you can do that! I recommend doing this through the GitHub UI. Once you delete the Release and Tag, you'll most likely encounter a git error the next time you try to push. If you do, run this command to force pull the tags:
```bash
git pull --tags origin main --force
```

### Game Server Deploy
To deploy the game server, create a new Tag that looks like `api-v*.*.*`. You can do this via the git CLI:
```bash
git tag api-v0.0.1
git push origin api-v0.0.1
```

Once you push the Tag, the GitHub Action will kick off the backend deployment. This will migrate the DB and update the running game API server.

**NOTE:** It's very important that you only create a Tag for backend deploys, and NOT a "Release". Releases are reserved for hosting the desktop app files only...

If you want to delete an API Tag, you can do that! I recommend doing this through the GitHub UI. Once you delete the Tag, you'll most likely encounter a git error the next time you try to push. If you do, run this command to remove the local Tag:
```bash
git tag -d api-v0.0.1
```

## Cost Breakdown

A focal point of this project is to be as cost-effective as possible at the start. Here's a breakdown of the costs associated with running everything:

|Provider|Service|Cost|
|--------|-------|----|
|GitHub Actions|CI/CD|Free|
|GitHub Pages|Web Hosting|Free|
|GitHub Releases|Desktop App Hosting|Free|
|Supabase|Auth and DB|Free|
|DigitalOcean|Persistent Server|~$4/month|
|Apple|macOS signing cert|~$8/month ($100/year)|
|Microsoft Azure|Windows signing cert|$10/month|

**TOTAL:** ~$22/month or ~$264/year
