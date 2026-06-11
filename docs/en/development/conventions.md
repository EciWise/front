# Development conventions

New Angular components should be standalone, OnPush and use inject().

## What this page covers

- New Angular components should be standalone, OnPush and use inject().
- Prefer signals and modern control flow for new UI state.
- Keep text translated and styling based on global tokens.

## Main files

- `src/app/features`
- `src/app/shared/ui`
- `src/app/core/i18n/translations`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
