# Open Model Listener — Dark Theme Profile

**Theme:** `dark`  
**Rule:** Use only tokens below. Map each token to `var(--token-name)` in CSS. Do not hardcode hex values in components.

---

## Background

| Token | Value | Use |
|-------|-------|-----|
| `bg-base` | `#0b0d12` | App shell, page root |
| `bg-surface` | `#12151c` | Cards, panels, sidebars |
| `bg-elevated` | `#1a1e28` | Modals, dropdowns, raised blocks |
| `bg-input` | `#0f1219` | Text fields, textareas |
| `border-subtle` | `#252a36` | Dividers, card outlines |
| `border-strong` | `#343b4a` | Focus rings, active borders |

---

## Text

| Token | Value | Use |
|-------|-------|-----|
| `text-primary` | `#f0f2f5` | Headings, body, labels |
| `text-secondary` | `#b8bec8` | Supporting copy, descriptions |
| `text-muted` | `#7a8290` | Placeholders, hints, disabled labels |
| `text-inverse` | `#0b0d12` | Text on bright/accent buttons |

---

## Accent

| Token | Value | Use |
|-------|-------|-----|
| `accent` | `#5b8def` | Links, active states, focus |
| `accent-hover` | `#7aa3f5` | Accent hover |
| `accent-muted` | `rgba(91, 141, 239, 0.15)` | Selected rows, soft highlights |

---

## Buttons

| Token | Value | Use |
|-------|-------|-----|
| `btn-primary-bg` | `#5b8def` | Primary button background |
| `btn-primary-bg-hover` | `#7aa3f5` | Primary button hover |
| `btn-primary-text` | `#0b0d12` | Primary button label |
| `btn-secondary-bg` | `#1a1e28` | Secondary button background |
| `btn-secondary-bg-hover` | `#252a36` | Secondary button hover |
| `btn-secondary-text` | `#f0f2f5` | Secondary button label |
| `btn-secondary-border` | `#343b4a` | Secondary button border |
| `btn-disabled-bg` | `#1a1e28` | Disabled button background |
| `btn-disabled-text` | `#5c6370` | Disabled button label |

---

## Typography

| Token | Value | Use |
|-------|-------|-----|
| `font-sans` | `system-ui, -apple-system, "Segoe UI", sans-serif` | All UI text |
| `font-mono` | `"Cascadia Code", "Consolas", monospace` | Code, API keys |
| `text-sm` | `0.875rem` | Captions, status |
| `text-base` | `1rem` | Body |
| `text-lg` | `1.125rem` | Subheadings |
| `text-xl` | `1.5rem` | Page titles |
| `font-weight-normal` | `400` | Body |
| `font-weight-medium` | `500` | Labels, buttons |
| `font-weight-semibold` | `600` | Headings |

---

## Radius & Spacing

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | `6px` | Inputs, chips |
| `radius-md` | `10px` | Buttons, cards |
| `radius-lg` | `14px` | Modals, large panels |
| `space-xs` | `0.25rem` | Tight gaps |
| `space-sm` | `0.5rem` | Inline spacing |
| `space-md` | `1rem` | Section padding |
| `space-lg` | `1.5rem` | Card padding |
| `space-xl` | `2rem` | Page margins |

---

## Shadows

| Token | Value | Use |
|-------|-------|-----|
| `shadow-sm` | `0 2px 8px rgba(0, 0, 0, 0.35)` | Buttons, chips |
| `shadow-md` | `0 8px 24px rgba(0, 0, 0, 0.45)` | Cards, panels |

---

## AI Implementation Rules

1. **Always** reference tokens — never invent one-off colors.
2. **Background stack:** `bg-base` → `bg-surface` → `bg-elevated` (deepest to highest).
3. **Text hierarchy:** `text-primary` > `text-secondary` > `text-muted`.
4. **Primary actions:** `btn-primary-*`. **Secondary/cancel:** `btn-secondary-*`.
5. **Interactive focus:** `border-strong` or `accent` outline on `:focus-visible`.
6. **CSS mapping:** `--bg-base`, `--text-primary`, `--btn-primary-bg`, etc. (prefix `--`, kebab-case).
