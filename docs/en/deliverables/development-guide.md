# Development guide

## Default workflow

1. Pull the latest branch state.
2. Inspect the target feature and nearby tests.
3. Make focused changes.
4. Add or update tests when behavior changes.
5. Run lint, tests and build.
6. Review the diff before opening a PR.

## Local commands

```powershell
npm install
Copy-Item .env.template .env
npm start
```

Quality:

```powershell
npm run lint
npm run test:ci
npm run build
```

Documentation:

```powershell
npm run docs:dev
npm run docs:build
```

## Coding standards

- Standalone Angular components.
- OnPush change detection.
- `inject()` for dependencies.
- Signals for local state.
- Domain services for backend calls.
- Shared UI primitives before new controls.
- Translation keys for all visible text.
- CSS tokens instead of hardcoded design values.

## PR checklist

- App builds.
- Relevant tests pass.
- No generated env/build artifacts are committed.
- UI remains responsive.
- Accessibility basics are preserved.
- Runtime config is documented if changed.

