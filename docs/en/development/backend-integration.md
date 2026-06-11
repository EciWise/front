# Backend integration

New backends should expose models, config tokens and dedicated services.

## What this page covers

- New backends should expose models, config tokens and dedicated services.
- Components should call domain services rather than HttpClient directly.
- Tutorships currently use a mock service designed to be replaced by an HTTP facade.

## Main files

- `src/app/app.config.ts`
- `src/app/core/config`
- `src/app/features/*/*.service.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
