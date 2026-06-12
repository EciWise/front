# Shared UI and layout reference

Shared UI and layout components are the default building blocks for feature screens.

## Layout components

| Component | Responsibility |
| --- | --- |
| `AppShellComponent` | Wraps authenticated areas with top bar, sidebar and main outlet |
| `TopBarComponent` | Logo, preferences, user context and logout |
| `SideNavComponent` | Role-based navigation |
| `FloatingActionsComponent` | Chat and assistant actions |
| `NotificationsBellComponent` | Notification trigger and panel |
| `DashboardGridComponent` | Reusable dashboard grid |

## UI primitives

| Component | Inputs/outputs to know | Notes |
| --- | --- | --- |
| `eci-button` | `variant`, `type`, `disabled`, `block`, `ariaLabel`, `(buttonClick)` | Use `(buttonClick)`, not host `(click)` |
| `eci-card` | projected content | Surface primitive |
| `eci-modal` | `open`, `titleKey`, `size`, `(openChange)` | Closes by button, backdrop and Escape |
| `eci-select` | `options`, `value`, `placeholder`, `ariaLabel`, `(valueChange)` | CVA, keyboard support, viewport-aware menu |
| `eci-date-picker` | CVA date value | Viewport-aware popup |
| `eci-time-picker` | CVA time value | Granularity and viewport-aware popup |
| `eci-section-tabs` | active/sections model | In-page navigation |
| `eci-icon` | `name`, `size` | Central icon registry |
| `eci-avatar` | `name`, `src`, `size` | Initials fallback |
| `eci-info-tooltip` | content/placement inputs | Keeps popup in viewport |
| `eci-password-strength-input` | CVA, `showStrength` | Password visibility and strength |

## Token requirements

Feature CSS should use:

- `--surface`, `--surface-2`, `--surface-3`
- `--text`, `--text-muted`, `--border`
- `--brand-red`, `--accent`
- `--space-*`
- `--radius-*`
- `--shadow-*`
- `--transition-*`

## Accessibility requirements

- All interactive controls must be keyboard reachable.
- Icon-only controls need accessible labels.
- Modals must have a clear close path.
- Selects/pickers must close from outside click and Escape where applicable.
- Error and success feedback should use semantic roles/live regions when important.
- Components must remain usable in dark and accessibility modes.

## When to create a new shared component

Create a new `shared/ui` component only when:

- At least two features need the same interaction.
- The component has reusable accessibility/state behavior.
- Existing primitives cannot compose the behavior cleanly.

Keep one-off domain UI inside the feature folder.
