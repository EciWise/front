# Design system

## Design principles

- Clarity before decoration.
- Accessibility by default.
- Shared components before one-off UI.
- Tokens before hardcoded values.
- Responsive layouts by default.

## Core tokens

| Family | Tokens |
| --- | --- |
| Brand | `--brand-black`, `--brand-red`, `--brand-red-dark`, `--brand-red-soft` |
| Surfaces | `--surface`, `--surface-2`, `--surface-3` |
| Text | `--text`, `--text-muted` |
| Spacing | `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8` |
| Radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` |
| Motion | `--transition-fast`, `--transition-base` |

## Component system

Use:

- `eci-button`
- `eci-card`
- `eci-modal`
- `eci-select`
- `eci-date-picker`
- `eci-time-picker`
- `eci-section-tabs`
- `eci-page-header`
- `eci-icon`
- `eci-avatar`
- `eci-info-tooltip`

## Accessibility rules

- Contrast minimum 4.5:1 for normal text.
- Visible focus states.
- Keyboard support for custom controls.
- Translated `aria-label` for icon-only buttons.
- No color-only status.
- Respect reduced-motion preferences.

