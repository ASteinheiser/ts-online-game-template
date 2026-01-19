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
- [Cost Breakdown](#cost-breakdown)

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

## Working with the PostgreSQL DB

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

<img src="./images/system-design.png" width="800px" height="auto">

### Web Hosting Setup

The web hosting setup is based on GitHub Pages and GitHub Actions. To get started:

Go to your github repository, then `Settings` > `Pages`, select `Source` and choose `GitHub Actions`.

> You can also add a custom domain via the `Custom domain` field. Make sure you follow the instructions to ensure you have the correct DNS records in place. Also ensure you select `Enforce HTTPS` and update the `/apps/web/public/CNAME` file with your custom domain.

Now go to `Settings` > `Environments`, then select (or create if needed) the `github-pages` environment. Fill out the `Environment secrets` section according to your `/apps/web/.env` file.

**NOTE:** Before hosting the `game-api`, you won't have a valid `VITE_API_URL`. So for now, just use the development value: `http://localhost:4204`

Now that everything is setup, you can either push to `main` or manually trigger the `Deploy Web to GitHub Pages` workflow from the `Actions` tab.

### Desktop File Hosting Setup

The desktop app files will be hosted via GitHub Releases and GitHub Actions. To get started:

Go to your github repository, then `Settings` > `Environments` and create the `github-releases` environment. Fill out the `Environment secrets` section according to your `/apps/desktop/.env` file.

**NOTE:** Before hosting the `game-api`, you won't have a valid `VITE_API_URL` or `VITE_WEBSOCKET_URL`. So for now, just use the development values: `http://localhost:4204` and `ws://localhost:4204` respectively.

**NOTE:** You will also need to set the `GH_TOKEN` environment secret. This is used to authenticate with the GitHub API and update the release with the desktop app files as they are built. [Generate a personal access token](https://github.com/settings/personal-access-tokens) and make sure to give it permissions to `read and write` on `Contents`.

#### macOS Signing

To sign and notarize builds for macOS, you'll need:
- a MacBook (Keychain Access app required)
- an [Apple Developer account](https://developer.apple.com/)
- to be enrolled in the paid [Apple Developer Program](https://developer.apple.com/programs/enroll/)

You'll also need to set the following:

| Repository Secret | Description |
|----|----|
| `APPLE_ID` | Email address of the Apple Developer account |
| `APPLE_APP_SPECIFIC_PASSWORD` | Generated "App-Specific Password" (16 characters) |
| `APPLE_TEAM_ID` | Team ID of the Apple Developer account (10 characters) |
| `MAC_CERT_B64` | Base64 encoded "Developer ID Application" certificate |
| `MAC_CERT_PASS` | Password for the certificate |

Setting your `APPLE_ID` should be easy, just use your email address that you'll use to log in at https://account.apple.com/. Once you log in, under "Sign-In and Security", you should see a section called "App-Specific Passwords". Create a new password and copy the value (this only shows once, 16 characters, ex: `asdf-asdf-asdf-asdf`). Now use that value to set the `APPLE_APP_SPECIFIC_PASSWORD` repository secret.

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
- As you save this file, you'll be prompted to enter a password for the certificate. This is the `MAC_CERT_PASS` that you'll need to set as a repository secret. I recommend using a password manager to generate a secure password.

You should now have a valid `.p12` file. You can base64 encode it, then copy the value, by running:
```bash
base64 < ~/path/to/cert_name.p12 | pbcopy
```

Finally, set the `MAC_CERT_B64` repository secret with the base64 encoded value (you can paste it directly from your clipboard).

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
    - "Application (client) ID" > set this as the `AZURE_CLIENT_ID` repository secret
    - "Directory (tenant) ID" > set this as the `AZURE_TENANT_ID` repository secret
- Now click on "Manage" > "Certificates & secrets"
- Click "New client secret" and create a new secret
- Ensure you copy the Value, as it will only show once!
- Set the `AZURE_CLIENT_SECRET` repository secret with the value you just copied

This final step is very important... You need to assign "Artifact Signing Certificate Profile Signer" permissions to your "App Registration":
- From your "Artifact Signing Account", click on "Access Control (IAM)"
- Click "Add" > "Add role assignment"
- Find and select the "Artifact Signing Certificate Profile Signer" role
- For "Members", you need to assign a "service principal" for your "App Registration"
- Click "Select members" and search for your "App Registration" by name
- Create the permission
- Double check the new permission in "Artifact Signing Account" > "Access Control (IAM)" > "Role assignments" tab

#### Deployment Trigger

The desktop app files can now be built, signed (macOS/win) and hosted in a GitHub Release! Simply create a Release with a new tag (such as `v0.0.1`) and the GitHub Action will kick off the build process for each OS. As each OS build completes, the Release will be updated with the desktop app files.

### Auth Setup

You should already have a Supabase project setup with JWT auth. So that piece is covered!

### Database Setup

Supabase offers a hosted PostgreSQL DB at no cost (limited storage/CPU). You can choose any other provider you'd like, and depending on your needs, you may want to compare pricing with [DigitalOcean](https://www.digitalocean.com/products/managed-databases-postgresql/) or [AWS RDS](https://aws.amazon.com/rds/postgresql/) at actual scale. But for a small project, Supabase is a great option.

Follow [these instructions](https://supabase.com/docs/guides/database/prisma) to setup a hosted PostgreSQL DB with Supabase for Prisma. You'll need to setup your Prisma user in Supabase and turn off the Supabase Data API setting.

TODO: update env

### Game Server Setup

TODO: create DigitalOcean Droplet

TODO: update env

## Cost Breakdown

A focal point of this project is to be as cost-effective as possible at the start. Here's a breakdown of the costs associated with running everything:

|Provider|Service|Cost|
|--------|-------|----|
|GitHub Actions|CI/CD|Free|
|GitHub Pages|Web Hosting|Free|
|GitHub Releases|Desktop App Hosting|Free|
|Supabase|Auth and DB|Free|
|DigitalOcean|Persistent Server|~$5/month|
|Apple|macOS signing cert|~$8/month ($100/year)|
|Microsoft Azure|Windows signing cert|$10/month|

**TOTAL:** ~$23/month or ~$280/year
