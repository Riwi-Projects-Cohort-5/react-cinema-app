# Design System

## Overview

This design system is based on a dark authentication interface focused on simplicity, accessibility, and clean spacing.

---

# Design Tokens

```css
@theme {

  /* ===========================================
     COLORS
  =========================================== */

  --color-background: #000000;

  --color-surface-100: rgb(51 65 85 / 70%);      /* slate-700/70 */

  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D1D5DB;               /* gray-300 */
  --color-text-placeholder: #9CA3AF;             /* gray-400 */

  --color-primary: #EA580C;                      /* orange-600 */
  --color-primary-hover: #C2410C;                /* orange-700 */
  --color-primary-light: #FB923C;                /* orange-400 */

  --color-success: #22C55E;

  --color-warning-bg: rgba(120,53,15,.40);
  --color-warning-border: #CA8A04;
  --color-warning-text: #FCD34D;

  --color-danger-bg: rgba(127,29,29,.40);
  --color-danger-border: #DC2626;
  --color-danger-text: #FCA5A5;

  /* ===========================================
     TYPOGRAPHY
  =========================================== */

  --font-sans: Inter, ui-sans-serif, system-ui;

  --text-xs: .75rem;
  --text-sm: .875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;

  /* ===========================================
     SPACING
  =========================================== */

  --spacing-xs: .25rem;
  --spacing-sm: .5rem;
  --spacing-md: .75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
  --spacing-2xl: 2rem;
  --spacing-3xl: 2.5rem;

  /* ===========================================
     BORDER RADIUS
  =========================================== */

  --radius-sm: .25rem;
  --radius-md: .375rem;
  --radius-lg: .5rem;
  --radius-xl: .75rem;
  --radius-full: 9999px;

  /* ===========================================
     SIZE
  =========================================== */

  --input-height: 3rem;
  --button-height: 3rem;
  --form-width: 28rem;

  /* ===========================================
     EFFECTS
  =========================================== */

  --shadow-sm: 0 1px 2px rgb(0 0 0 / .08);
  --shadow-md: 0 4px 12px rgb(0 0 0 / .15);

  --ring-primary: var(--color-primary);

  /* ===========================================
     TRANSITIONS
  =========================================== */

  --ease-default: cubic-bezier(.4,0,.2,1);

  --duration-fast: 150ms;
  --duration-normal: 200ms;
}
```

---

# Color Palette

| Token | Value | Usage |
|--------|-------|-------|
| background | #000000 | App background |
| surface | slate-700/70 | Inputs |
| primary | orange-600 | Buttons |
| primary-hover | orange-700 | Hover state |
| primary-light | orange-400 | Links |
| text-primary | white | Titles |
| text-secondary | gray-300 | Paragraphs |
| placeholder | gray-400 | Inputs |
| warning | yellow | Verification message |
| danger | red | Blocked account |

---

# Typography

## Heading

- Size: 30px
- Weight: 700
- Color: White

## Body

- Size: 16px
- Weight: 400

## Small

- Size: 14px
- Used for:
    - labels
    - helper text
    - links

---

# Spacing Scale

| Token | Size |
|--------|------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| 2xl | 32px |
| 3xl | 40px |

---

# Components

## Button

Primary

Properties

- Height: 48px
- Radius: 8px
- Background: Primary
- Text: White
- Font Weight: Bold

States

- Default
- Hover
- Disabled
- Loading

---

## Text Input

Properties

- Height: 48px
- Radius: 8px
- Background: Surface
- Text: White
- Placeholder: Gray

States

- Default
- Focus
- Filled
- Error
- Disabled

---

## Password Field

Contains

- Input
- Visibility Toggle Button

States

- Hidden
- Visible

---

## Alert

### Warning

- Yellow background
- Yellow border
- Yellow text

Used for

- Email not verified

### Danger

- Red background
- Red border
- Red text

Used for

- Account blocked

---

## Checkbox

Properties

- Accent Color: Primary
- Label: Secondary Text

---

## Links

Color

Primary Light

Examples

- Forgot Password
- Sign Up

---

# Layout

Authentication Layout

```
Viewport
│
├── Background
│
└── Center Container
      │
      └── Form
            ├── Title
            ├── Alerts
            ├── Email
            ├── Password
            ├── Forgot Password
            ├── Login Button
            ├── Register Link
            └── Remember Me
```

Maximum Width

448px

Alignment

Centered horizontally and vertically

---

# Interaction

Focus Ring

- 2px
- Primary Color

Transition

200ms

Hover

Primary → Primary Hover

---

# Accessibility

- Visible focus ring
- Minimum touch target of 48px
- High contrast text
- Semantic labels
- Keyboard accessible controls
- Password visibility toggle