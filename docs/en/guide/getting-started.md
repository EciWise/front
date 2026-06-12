# Getting started

This page explains how to run the frontend, documentation site and checks locally.

## Prerequisites

- Node.js compatible with Angular 21.
- npm 11, as declared in `packageManager`.
- Backend services or mock/local URLs configured through `.env`.

## Install

```powershell
npm install
```

## Configure runtime services

```powershell
Copy-Item .env.template .env
```

Edit `.env` if your services do not run on the defaults:

```ini
PORT=4000
AUTH_SERVICE=http://localhost:3001
STUDY_SERVICE=http://localhost:8082
TALK_SERVICE=http://localhost:3003
TALK_WS=ws://localhost:3003/ws/chat
TODO_SERVICE=http://localhost:8083
```

## Run the app

```powershell
npm start
```

`npm start` runs `prestart`, writes `public/assets/env.json`, and starts the dev server through `scripts/serve.mjs`.

Direct Angular CLI access is also available:

```powershell
npm run ng -- serve
```

## Build SSR output

```powershell
npm run build
```

The Angular SSR output is generated at:

```text
dist/ECIWISE-Front
```

Run the generated server:

```powershell
npm run serve:ssr:ECIWISE-Front
```

## Run documentation

```powershell
npm run docs:dev
npm run docs:build
npm run docs:preview
```

The VitePress build output is:

```text
docs/.vitepress/dist
```

## Quality commands

```powershell
npm run lint
npm run test:ci
npm run test:unit
npm run test:integration
npm run test:coverage
npm run e2e
```

Use `npm run build` before opening a PR that affects routes, SSR, app configuration, lazy modules or shared styles.

## Main files

- `package.json`
- `.env.template`
- `scripts/write-env.mjs`
- `scripts/serve.mjs`
- `angular.json`
