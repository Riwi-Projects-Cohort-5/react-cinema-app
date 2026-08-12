# Design System — Authentication UI

## 1. Overview

This design system is derived from the `LoginPage` component and defines the visual foundations, design tokens, components, states, spacing, typography, and responsive behavior used by the authentication interface.

The system is implemented using **Tailwind CSS v4** and its `@theme` directive.

### Design principles

* **Clarity:** Authentication actions should be immediately understandable.
* **Accessibility:** Focus, disabled, error, and warning states must be visually distinguishable.
* **Consistency:** Components should use semantic tokens instead of hardcoded colors.
* **Responsiveness:** The interface must adapt from mobile to desktop.
* **Maintainability:** Visual values should be controlled through centralized design tokens.

---

# 2. Design Tokens

Design tokens are the single source of truth for the UI.

The component should use semantic tokens such as:

```text
background
surface
surface-variant
primary
primary-hover
accent
text-primary
text-secondary
text-disabled
border
warning
error
```

These names describe the **purpose** of a value rather than its specific color.

---

# 3. Tailwind CSS v4 Theme

The following tokens can be placed in the project's global CSS file.

```css
@import "tailwindcss";

@theme {
  /* ========================================
     COLORS
     ======================================== */

  /* Main page background */
  --color-background: #f8fafc;

  /* Main component surface */
  --color-surface: #ffffff;

  /* Inputs and secondary surfaces */
  --color-surface-variant: #f1f5f9;

  /* Primary action */
  --color-primary: #2563eb;

  /* Primary hover state */
  --color-primary-hover: #1d4ed8;

  /* Secondary/accent action */
  --color-accent: #2563eb;

  /* Main text */
  --color-text-primary: #0f172a;

  /* Secondary text */
  --color-text-secondary: #64748b;

  /* Disabled / placeholder text */
  --color-text-disabled: #94a3b8;

  /* Borders */
  --color-border: #cbd5e1;

  /* Feedback */
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-success: #16a34a;

  /* ========================================
     TYPOGRAPHY
     ======================================== */

  --font-family-sans: Inter, ui-sans-serif, system-ui, sans-serif;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;

  /* ========================================
     SPACING
     ======================================== */

  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;

  /* ========================================
     BORDER RADIUS
     ======================================== */

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* ========================================
     SHADOWS
     ======================================== */

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);

  --shadow-md:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);

  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);

  --shadow-2xl:
    0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

> **Note:** The original component establishes semantic token names but does not provide their exact color values. The values above are a baseline implementation and should be replaced with the project's approved brand colors if those already exist.

---

# 4. Color System

## 4.1 Background

| Token             | Tailwind class       | Purpose                           |
| ----------------- | -------------------- | --------------------------------- |
| `background`      | `bg-background`      | Main application/page background  |
| `surface`         | `bg-surface`         | Cards, forms and elevated content |
| `surface-variant` | `bg-surface-variant` | Inputs and secondary surfaces     |

### Usage

```tsx
<div className="bg-background">
  <div className="bg-surface">
    ...
  </div>
</div>
```

---

## 4.2 Primary

| Token           | Tailwind class     | Purpose                     |
| --------------- | ------------------ | --------------------------- |
| `primary`       | `bg-primary`       | Main CTA/action             |
| `primary-hover` | `bg-primary-hover` | Hover state                 |
| `accent`        | `text-accent`      | Links and secondary actions |

### Usage

```tsx
<button className="bg-primary hover:bg-primary-hover">
  Login
</button>
```

---

## 4.3 Text

| Token            | Tailwind class        | Purpose                              |
| ---------------- | --------------------- | ------------------------------------ |
| `text-primary`   | `text-text-primary`   | Headings, labels and primary content |
| `text-secondary` | `text-text-secondary` | Supporting text                      |
| `text-disabled`  | `text-text-disabled`  | Disabled/placeholder content         |

### Hierarchy

```text
text-primary
    ↓
text-secondary
    ↓
text-disabled
```

---

## 4.4 Feedback

### Warning

```tsx
<div className="bg-warning/10 border border-warning text-warning">
  Warning message
</div>
```

### Error

```tsx
<div className="bg-error/10 border border-error text-error">
  Error message
</div>
```

### Success

The `success` token is included for future authentication states.

```tsx
<div className="bg-success/10 border border-success text-success">
  Success message
</div>
```

---

# 5. Typography

The authentication interface uses a simple hierarchy.

## Page title

```text
font-bold
text-3xl
text-text-primary
text-center
```

Example:

```tsx
<h1 className="text-text-primary font-bold text-3xl text-center">
  Sign in
</h1>
```

## Labels

```text
text-sm
text-text-primary
```

Example:

```tsx
<label className="text-text-primary text-sm">
  Email Address
</label>
```

## Supporting text

```text
text-sm
text-text-secondary
```

Example:

```tsx
<p className="text-text-secondary text-sm">
  Don't have an account?
</p>
```

## Links

```text
text-sm
text-accent
hover:underline
```

---

# 6. Spacing System

The Login Page follows a consistent spacing scale.

| Token        | Value | Typical usage              |
| ------------ | ----: | -------------------------- |
| `spacing-1`  |   4px | Label/input spacing        |
| `spacing-2`  |   8px | Icon and text spacing      |
| `spacing-3`  |  12px | Alerts and controls        |
| `spacing-4`  |  16px | Standard component spacing |
| `spacing-6`  |  24px | Form element separation    |
| `spacing-10` |  40px | Form container padding     |
| `spacing-12` |  48px | Large sections             |

The Login form uses:

```tsx
gap-6
```

for vertical separation between form sections.

---

# 7. Border Radius

The system uses rounded components with progressively larger radii.

| Token         |  Value | Usage                    |
| ------------- | -----: | ------------------------ |
| `radius-sm`   |    4px | Small controls           |
| `radius-md`   |    6px | Inputs                   |
| `radius-lg`   |    8px | Buttons                  |
| `radius-2xl`  |   16px | Cards                    |
| `radius-3xl`  |   24px | Authentication container |
| `radius-full` | 9999px | Circular elements        |

The Login Page's main container uses:

```tsx
rounded-3xl
```

while inputs and buttons use:

```tsx
rounded
```

---

# 8. Shadows

The authentication card uses a strong elevation level.

```tsx
shadow-2xl
```

The primary color is also incorporated into the shadow:

```tsx
shadow-2xl shadow-primary/20
```

This creates a branded elevation effect.

### Shadow hierarchy

```text
shadow-sm
    ↓
shadow-md
    ↓
shadow-lg
    ↓
shadow-2xl
```

---

# 9. Component: Authentication Container

The authentication layout is composed of two columns on desktop.

```tsx
<div
  className="
    flex
    w-full
    max-w-5xl
    rounded-3xl
    overflow-hidden
    shadow-2xl
    shadow-primary/20
    border
    border-border
  "
>
```

### Properties

* Maximum width: `max-w-5xl`
* Width: `w-full`
* Layout: `flex`
* Radius: `rounded-3xl`
* Overflow: `hidden`
* Border: `border-border`
* Elevation: `shadow-2xl`
* Brand shadow: `shadow-primary/20`

---

# 10. Component: Image Panel

The image panel is displayed only on medium-sized screens and above.

```tsx
<div className="hidden md:block w-1/2 relative">
  <img
    src={login}
    alt="Login banner"
    className="w-full h-full object-cover"
  />
</div>
```

### Responsive behavior

| Breakpoint     | Behavior  |
| -------------- | --------- |
| Mobile         | Hidden    |
| `md` and above | Visible   |
| Desktop        | 50% width |

### Image rules

```text
width: 100%
height: 100%
object-fit: cover
```

---

# 11. Component: Form Panel

The form panel occupies the entire screen width on mobile and half of the container on desktop.

```tsx
<div
  className="
    w-full
    md:w-1/2
    bg-surface
    flex
    items-center
    justify-center
    p-10
  "
>
```

### Responsive behavior

```text
Mobile:
w-full

Desktop:
md:w-1/2
```

---

# 12. Component: Form

The form uses a vertical layout.

```tsx
<form
  className="
    bg-transparent
    flex
    flex-col
    gap-6
    w-full
    max-w-md
  "
>
```

### Rules

* Full available width
* Maximum width: `max-w-md`
* Vertical layout
* Consistent `gap-6`
* Transparent form background

---

# 13. Component: Input

Inputs share the same base style.

```tsx
<input
  className="
    w-full
    bg-surface-variant
    text-text-primary
    h-12
    px-4
    rounded
    border
    border-border
    placeholder-text-disabled
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    focus:border-primary
    disabled:opacity-60
  "
/>
```

## Input dimensions

```text
Height: 48px
Horizontal padding: 16px
Border: 1px
Radius: 4px
Width: 100%
```

## Input states

### Default

```text
bg-surface-variant
border-border
text-text-primary
```

### Focus

```text
focus:ring-2
focus:ring-primary
focus:border-primary
```

### Disabled

```text
disabled:opacity-60
```

### Placeholder

```text
placeholder-text-disabled
```

---

# 14. Component: Password Input

Password inputs include an action button positioned inside the input.

```tsx
<div className="relative">
  <input className="w-full pr-10 ..." />

  <button
    type="button"
    className="
      absolute
      right-3
      top-3.5
      text-text-secondary
      hover:text-text-primary
      disabled:opacity-60
    "
  >
    ...
  </button>
</div>
```

### Password visibility states

```text
Hidden password
    ↓
Eye-off icon
    ↓
Visible password
    ↓
Eye icon
```

The visibility control should:

* Be keyboard accessible.
* Remain inside the input boundary.
* Use `text-text-secondary` by default.
* Change to `text-text-primary` on hover.
* Become visually disabled while submitting.

---

# 15. Component: Primary Button

The primary button is the main authentication action.

```tsx
<button
  type="submit"
  className="
    bg-primary
    hover:bg-primary-hover
    text-text-primary
    font-bold
    h-12
    rounded
    mt-2
    transition
    flex
    items-center
    justify-center
    gap-2
    disabled:opacity-70
    disabled:cursor-not-allowed
  "
>
  Login
</button>
```

## Button dimensions

```text
Height: 48px
Width: 100%
Radius: 4px
Font weight: 700
```

## Button states

### Default

```tsx
bg-primary
```

### Hover

```tsx
hover:bg-primary-hover
```

### Disabled

```tsx
disabled:opacity-70
disabled:cursor-not-allowed
```

### Loading

The button replaces the text with:

```text
[Spinner] Signing in...
```

---

# 16. Component: Loading Spinner

The spinner uses an SVG with Tailwind's animation utility.

```tsx
<svg
  className="animate-spin h-5 w-5 text-text-primary"
  ...
>
```

### Spinner tokens

```text
Size: 20px
Animation: spin
Color: text-primary
```

---

# 17. Component: Alert

Alerts communicate authentication-related feedback.

## Warning

```tsx
<div
  className="
    bg-warning/10
    border
    border-warning
    text-warning
    text-sm
    rounded
    p-3
  "
>
  ...
</div>
```

## Error

```tsx
<div
  className="
    bg-error/10
    border
    border-error
    text-error
    text-sm
    rounded
    p-3
  "
>
  ...
</div>
```

### Alert anatomy

```text
Background: semantic color at 10% opacity
Border: semantic color
Text: semantic color
Typography: text-sm
Padding: p-3
Radius: rounded
```

---

# 18. Component: Link

Authentication links use the accent token.

```tsx
<Link
  to="/forgot-password"
  className="
    text-accent
    text-sm
    cursor-pointer
    hover:underline
  "
>
  Forgot my password
</Link>
```

### Link states

| State    | Style                                 |
| -------- | ------------------------------------- |
| Default  | `text-accent`                         |
| Hover    | `underline`                           |
| Disabled | Not applicable                        |
| Focus    | Should include visible keyboard focus |

Recommended accessibility enhancement:

```tsx
focus:outline-none
focus:ring-2
focus:ring-primary
focus:ring-offset-2
```

---

# 19. Component: Checkbox

The Remember Me control uses a native checkbox.

```tsx
<label
  className="
    flex
    items-center
    gap-2
    text-text-secondary
    text-sm
    mt-2
  "
>
  <input
    type="checkbox"
    className="accent-primary"
  />

  Remember me
</label>
```

### Checkbox rules

* Native checkbox behavior should be preserved.
* Accent color uses `primary`.
* Label uses `text-secondary`.
* Spacing between checkbox and label: `gap-2`.

---

# 20. Responsive Design

The Login Page uses a mobile-first strategy.

## Mobile

```text
Image panel: hidden
Form panel: 100% width
Container: 100% width
Form: max-width constrained
```

## Medium screens and above

```text
Image panel: 50%
Form panel: 50%
Authentication container: max-w-5xl
```

### Responsive implementation

```tsx
<div className="flex w-full max-w-5xl">
  <div className="hidden md:block w-1/2">
    ...
  </div>

  <div className="w-full md:w-1/2">
    ...
  </div>
</div>
```

---

# 21. Accessibility

The design system should maintain the following accessibility rules.

## Labels

Every form input must have an associated label.

Recommended implementation:

```tsx
<label htmlFor="email">
  Email Address
</label>

<input
  id="email"
  name="email"
/>
```

## Focus

Interactive controls must provide visible focus feedback.

Recommended:

```tsx
focus:outline-none
focus:ring-2
focus:ring-primary
focus:ring-offset-2
```

## Disabled controls

Disabled elements must communicate their state visually.

```tsx
disabled:opacity-60
disabled:cursor-not-allowed
```

## Loading state

While authentication is processing:

```text
Inputs → disabled
Password toggle → disabled
Submit button → disabled
Spinner → visible
Button text → "Signing in..."
```

---

# 22. Component State Model

The Login Page currently supports the following UI states.

```text
                    Login Page
                        │
        ┌───────────────┼───────────────┐
        │               │               │
      Default         Loading         Feedback
        │               │               │
        │               │       ┌───────┴───────┐
        │               │       │               │
     Editable        Disabled  Warning         Error
        │
        └── Password visibility
                │
          ┌─────┴─────┐
          │           │
        Hidden       Visible
```

---

# 23. Semantic Token Rules

Components should **not** use hardcoded colors.

### Avoid

```tsx
<button className="bg-blue-600">
```

### Prefer

```tsx
<button className="bg-primary">
```

### Avoid

```tsx
<input className="text-gray-900 border-gray-300">
```

### Prefer

```tsx
<input className="text-text-primary border-border">
```

This allows the entire application's visual identity to be changed by modifying the theme rather than individual components.

---

# 24. Recommended Component API

If the design system is expanded into reusable React components, the following APIs are recommended.

## Button

```tsx
<Button
  variant="primary"
  loading={isSubmitting}
  disabled={isSubmitting}
>
  Login
</Button>
```

### Variants

```text
primary
secondary
ghost
danger
```

---

## Input

```tsx
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={...}
  disabled={isSubmitting}
/>
```

---

## PasswordInput

```tsx
<PasswordInput
  label="Password"
  value={password}
  onChange={...}
  disabled={isSubmitting}
/>
```

---

## Alert

```tsx
<Alert variant="warning">
  Your account has not been verified yet.
</Alert>
```

### Variants

```text
warning
error
success
info
```

---

# 25. Token Usage Examples

## Page

```tsx
<div className="min-h-screen bg-background">
```

## Card

```tsx
<div className="bg-surface border border-border rounded-3xl shadow-2xl">
```

## Heading

```tsx
<h1 className="text-text-primary text-3xl font-bold">
```

## Input

```tsx
<input
  className="
    bg-surface-variant
    text-text-primary
    border-border
    focus:ring-primary
  "
/>
```

## Primary action

```tsx
<button
  className="
    bg-primary
    hover:bg-primary-hover
    text-text-primary
  "
>
```

## Secondary action

```tsx
<a className="text-accent hover:underline">
```

---

# 26. Design System Architecture

Recommended project structure:

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── Alert.tsx
│   │   └── Checkbox.tsx
│   │
│   └── auth/
│       ├── AuthLayout.tsx
│       └── AuthForm.tsx
│
├── pages/
│   ├── LoginPage.tsx
│   └── RecoverPassword.tsx
│
├── styles/
│   └── globals.css
│
└── assets/
    └── login.png
```

The design tokens should live in:

```text
src/styles/globals.css
```

---

# 27. Tailwind v4 Usage

With Tailwind CSS v4, tokens are defined directly using `@theme`.

```css
@theme {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
}
```

These automatically become utilities:

```text
bg-primary
bg-primary-hover
bg-background
bg-surface
```

Likewise:

```css
@theme {
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
}
```

creates:

```text
text-text-primary
text-text-secondary
```

This makes the semantic design system directly usable inside React components.

---

# 28. Final Token Reference

| Category | Token           | Utility               |
| -------- | --------------- | --------------------- |
| Color    | Background      | `bg-background`       |
| Color    | Surface         | `bg-surface`          |
| Color    | Surface Variant | `bg-surface-variant`  |
| Color    | Primary         | `bg-primary`          |
| Color    | Primary Hover   | `bg-primary-hover`    |
| Color    | Accent          | `text-accent`         |
| Color    | Text Primary    | `text-text-primary`   |
| Color    | Text Secondary  | `text-text-secondary` |
| Color    | Text Disabled   | `text-text-disabled`  |
| Color    | Border          | `border-border`       |
| Color    | Warning         | `text-warning`        |
| Color    | Error           | `text-error`          |
| Color    | Success         | `text-success`        |
| Radius   | Small           | `rounded-sm`          |
| Radius   | Medium          | `rounded-md`          |
| Radius   | Large           | `rounded-lg`          |
| Radius   | Extra Large     | `rounded-2xl`         |
| Radius   | Authentication  | `rounded-3xl`         |
| Shadow   | Small           | `shadow-sm`           |
| Shadow   | Medium          | `shadow-md`           |
| Shadow   | Large           | `shadow-lg`           |
| Shadow   | Extra Large     | `shadow-2xl`          |

---

# 29. Design System Goal

The final objective is to make the authentication interface **token-driven rather than component-driven**.

The component should describe **what an element is**:

```tsx
bg-primary
text-text-primary
border-border
```

rather than **what color it happens to be**:

```tsx
bg-blue-600
text-gray-900
border-gray-300
```

This allows the visual identity of the application to evolve without rewriting the React components.

The `LoginPage` therefore becomes an implementation of the design system rather than the place where the design system itself is defined.
