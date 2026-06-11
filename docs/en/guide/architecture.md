# Architecture

app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.

## What this page covers

- app.config.ts wires router, HTTP, hydration, interceptors and runtime providers.
- core contains cross-cutting concerns, features contains domain screens and shared contains reusable UI/layout.
- Browser-only APIs are protected for SSR compatibility.

## Main files

- `src/app/app.config.ts`
- `src/app/core`
- `src/app/features`
- `src/app/shared`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
