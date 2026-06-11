# UI system

The UI system is based on global CSS tokens and shared eci-* components.

## What this page covers

- The UI system is based on global CSS tokens and shared eci-* components.
- Theme and accessibility modes are global and must be respected by feature CSS.
- eci-select receives explicit options from each page.

## Main files

- `src/styles.css`
- `src/app/shared/ui`
- `src/app/shared/layout`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
