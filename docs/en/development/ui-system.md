# UI system

The UI system is token-driven and component-based. Global tokens live in `src/styles.css`; reusable primitives live in `src/app/shared/ui`.

## Tokens

### Brand

| Token | Value | Use |
| --- | --- | --- |
| `--brand-black` | `#08080a` | Strong text, dark brand surfaces |
| `--brand-red` | `#c8102e` | Primary actions, logo and emphasis |
| `--brand-red-dark` | `#99000d` | Hover and active states |
| `--brand-red-soft` | `#e23a52` | Dark theme accent |

### Role accents

| Token | Value | Use |
| --- | --- | --- |
| `--accent-student` | `#9a0d0d` | Student visual accent |
| `--accent-tutor` | `#c8102e` | Tutor visual accent |
| `--accent-admin` | `#5a2a82` | Admin visual accent |

### Structure

| Token family | Values |
| --- | --- |
| Spacing | `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8` |
| Radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Motion | `--transition-fast`, `--transition-base` |
| Typography | `--font-sans`, `--font-field` |

## Themes

Theme is applied through `html[data-theme='light']` or `html[data-theme='dark']`. Feature CSS must use semantic tokens:

- `--surface`
- `--surface-2`
- `--surface-3`
- `--text`
- `--text-muted`
- `--border`
- `--overlay`
- `--accent`

Do not hardcode theme-specific colors inside components.

## Accessibility mode

`A11yService` toggles the global `a11y-mode` class. This mode increases contrast, borders and focus visibility. Components should not override it with low-contrast local rules.

## Shared components

| Component | Selector | Purpose |
| --- | --- | --- |
| Button | `eci-button` | Primary, secondary and ghost actions |
| Card | `eci-card` | Reusable content surface |
| Modal | `eci-modal` | Dialogs and secondary forms |
| Select | `eci-select` | Accessible custom select/CVA |
| Date picker | `eci-date-picker` | Date selection |
| Time picker | `eci-time-picker` | Time selection |
| Section tabs | `eci-section-tabs` | In-page segmented navigation |
| Page header | `eci-page-header` | Screen title with icon |
| Icon | `eci-icon` | Central Lucide icon wrapper |
| Avatar | `eci-avatar` | User initials/image |
| Tooltip | `eci-info-tooltip` | Contextual help |
| Status switcher | `eci-status-switcher` | Compact status control |
| Password strength input | `eci-password-strength-input` | Password CVA with strength state |
| Charts | `eci-pie-chart`, `eci-histogram` | Simple data visualizations |
| Logo | `eci-logo` | Brand mark and home link |
| Confetti | `eci-confetti` | Celebration effect |

## Component usage rules

- Listen to `(buttonClick)` on `eci-button`.
- Give icon-only buttons an accessible label.
- Keep select options owned by the page or feature domain.
- Use `eci-modal` for blocking secondary flows, not primary navigation.
- Use charts only with labels/legends that do not rely on color alone.
- Respect disabled state semantically, not just visually.

## Layout rules

- Use the app shell for authenticated areas.
- Use cards for repeated items, panels and framed tools.
- Do not nest cards inside cards unless there is a real repeated item boundary.
- Keep text readable at mobile widths.
- Avoid fixed pixel widths where content may wrap or translate longer.
- Keep focus order aligned with visual order.
