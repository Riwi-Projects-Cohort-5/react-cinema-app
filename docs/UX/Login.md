# Login Page — Design System Documentation

## Overview

This design system was extracted from the `LoginPage` component and follows the same **Tailwind CSS v4 token architecture** as the Forgot Password page.

The system uses semantic design tokens through `@theme`, making the visual language reusable across the authentication flow.

---

# Design Principles

### Goals

* Clear and simple authentication flow
* Strong visual hierarchy
* Consistent authentication experience
* Accessible form controls
* Clear validation and account-status feedback
* Responsive split-screen layout
* Reusable semantic tokens
* Consistent interaction states
* Tailwind CSS v4 compatibility

---

# Tailwind v4 Theme Tokens

```css
@theme {

  /* ==========================================
     COLORS
  ========================================== */

  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;

  --color-accent: #3b82f6;

  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  --color-background: #f8fafc;

  --color-surface: #ffffff;
  --color-surface-variant: #f1f5f9;

  --color-border: #e2e8f0;

  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-disabled: #94a3b8;


  /* ==========================================
     TYPOGRAPHY
  ========================================== */

  --font-sans:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;


  /* ==========================================
     FONT SIZES
  ========================================== */

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;


  /* ==========================================
     FONT WEIGHTS
  ========================================== */

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;


  /* ==========================================
     SPACING
  ========================================== */

  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;


  /* ==========================================
     RADIUS
  ========================================== */

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;


  /* ==========================================
     SHADOWS
  ========================================== */

  --shadow-card:
    0 10px 25px rgba(37, 99, 235, 0.15);

  --shadow-modal:
    0 20px 40px rgba(15, 23, 42, 0.15);


  /* ==========================================
     TRANSITIONS
  ========================================== */

  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

  --duration-fast: 150ms;
  --duration-normal: 250ms;
}
```

---

# Color System

## Primary

The primary color represents the main action of the authentication interface.

### Used for

* Login button
* Input focus ring
* Input focus border
* Checkbox accent
* Primary interactive states

| Token           | Value     |
| --------------- | --------- |
| `primary`       | `#2563eb` |
| `primary-hover` | `#1d4ed8` |

Example:

```html
<button class="bg-primary hover:bg-primary-hover">
```

---

# Accent

The accent color is used for secondary interactive elements.

### Used for

* Forgot password link
* Sign-up link
* Other navigation actions

| Token    | Value     |
| -------- | --------- |
| `accent` | `#3b82f6` |

Example:

```html
<Link class="text-accent hover:underline">
```

---

# Feedback Colors

The login screen supports three semantic feedback states.

| Token     | Purpose                    | Value     |
| --------- | -------------------------- | --------- |
| `success` | Successful operation       | `#22c55e` |
| `warning` | Account requires attention | `#f59e0b` |
| `error`   | Critical account issue     | `#ef4444` |

---

## Warning

Used when the user's account has not been verified.

```html
<div class="bg-warning/10 border border-warning text-warning">
```

Example message:

```text
Your account has not been verified yet.
Check your email to activate it.
```

---

## Error

Used when the account has been temporarily blocked.

```html
<div class="bg-error/10 border border-error text-error">
```

Example message:

```text
Your account is temporarily blocked due to
too many failed attempts.
```

---

# Surface Colors

| Token             | Usage                         |
| ----------------- | ----------------------------- |
| `background`      | Main application background   |
| `surface`         | Authentication card/form area |
| `surface-variant` | Input background              |

```text
Background       → #f8fafc
Surface          → #ffffff
Surface Variant  → #f1f5f9
```

---

# Text Colors

| Token            | Usage                            |
| ---------------- | -------------------------------- |
| `text-primary`   | Headings, labels, main content   |
| `text-secondary` | Supporting text                  |
| `text-disabled`  | Disabled and placeholder content |

```text
Primary    → #0f172a
Secondary  → #64748b
Disabled   → #94a3b8
```

---

# Typography

## Page Heading

The login screen uses a large bold heading.

```html
<h1 class="text-text-primary font-bold text-3xl">
  Sign in
</h1>
```

### Specifications

| Property  | Value          |
| --------- | -------------- |
| Size      | `text-3xl`     |
| Weight    | `bold`         |
| Color     | `text-primary` |
| Alignment | Center         |

---

## Body Text

Used for:

* Supporting information
* Account navigation
* Form descriptions

```html
<p class="text-text-secondary text-sm">
```

---

## Form Labels

```html
<label class="text-text-primary text-sm">
```

### Specifications

* Size: `text-sm`
* Weight: Regular
* Color: `text-primary`

---

# Layout System

## Main Page Container

```html
<div class="min-h-screen flex items-center justify-center bg-background p-6">
```

### Responsibilities

* Occupies the complete viewport
* Centers authentication content
* Provides responsive padding
* Uses the global background token

---

# Authentication Card

```html
<div
  class="
    flex
    w-full
    max-w-5xl
    rounded-3xl
    overflow-hidden
    shadow-2xl
    border
    border-border
  "
>
```

### Specifications

| Property  | Value           |
| --------- | --------------- |
| Width     | `100%`          |
| Max Width | `max-w-5xl`     |
| Radius    | `rounded-3xl`   |
| Border    | `border-border` |
| Overflow  | Hidden          |
| Shadow    | Elevated        |

---

# Responsive Layout

## Desktop

The authentication card uses two equal columns.

```text
┌─────────────────────┬─────────────────────┐
│                     │                     │
│                     │                     │
│       IMAGE         │       LOGIN         │
│                     │       FORM          │
│                     │                     │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

### Width

```text
Image → 50%
Form  → 50%
```

---

## Mobile

The image disappears and the form occupies the full width.

```text
┌─────────────────────────┐
│                         │
│         LOGIN           │
│         FORM            │
│                         │
└─────────────────────────┘
```

Breakpoint:

```text
md → 768px
```

Implementation:

```html
<div class="hidden md:block w-1/2">
```

and:

```html
<div class="w-full md:w-1/2">
```

---

# Form System

The login form follows a vertical layout.

```html
<form class="flex flex-col gap-6 w-full max-w-md">
```

### Specifications

| Property  | Value      |
| --------- | ---------- |
| Max Width | `max-w-md` |
| Layout    | Column     |
| Gap       | `24px`     |
| Alignment | Centered   |

---

# Input Component

The same input system is used for email and password.

```html
<input
  class="
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
  "
/>
```

## Specifications

| Property           | Value             |
| ------------------ | ----------------- |
| Height             | `48px`            |
| Horizontal Padding | `16px`            |
| Background         | `surface-variant` |
| Border             | `border`          |
| Radius             | `md`              |
| Text               | `text-primary`    |

---

# Input States

## Default

```text
Background: Surface Variant
Border: Border
Text: Primary
```

---

## Focus

```text
Ring: Primary
Border: Primary
Ring Width: 2px
```

Implementation:

```html
focus:ring-2
focus:ring-primary
focus:border-primary
```

---

## Disabled

```html
disabled:opacity-60
```

Disabled inputs become visually less prominent while remaining readable.

---

# Password Input

The password field introduces an additional interactive component: the visibility toggle.

```text
┌─────────────────────────────────────┐
│ Password                         👁  │
└─────────────────────────────────────┘
```

The input reserves additional right-side space:

```html
pr-10
```

The visibility button is positioned absolutely:

```html
class="absolute right-3 top-3.5"
```

---

# Password Visibility Toggle

## Purpose

Allows users to switch between:

```text
password
```

and:

```text
text
```

---

## States

### Hidden

Displays the "eye-off" icon.

### Visible

Displays the "eye" icon.

---

## Interactive States

| State    | Behavior       |
| -------- | -------------- |
| Default  | Secondary text |
| Hover    | Primary text   |
| Disabled | 60% opacity    |

```html
text-text-secondary
hover:text-text-primary
disabled:opacity-60
```

---

# Forgot Password Link

```html
<Link
  to="/forgot-password"
  class="text-accent text-sm cursor-pointer hover:underline"
>
  Forgot my password
</Link>
```

### Specifications

| Property  | Value     |
| --------- | --------- |
| Color     | Accent    |
| Size      | `sm`      |
| Hover     | Underline |
| Alignment | Right     |

The link is intentionally visually secondary to the primary login button.

---

# Primary Button

```html
<button
  class="
    bg-primary
    hover:bg-primary-hover
    text-text-primary
    font-bold
    h-12
    rounded
    transition
  "
>
  Login
</button>
```

## Specifications

| Property    | Value         |
| ----------- | ------------- |
| Height      | `48px`        |
| Background  | Primary       |
| Hover       | Primary Hover |
| Text Weight | Bold          |
| Radius      | `md`          |
| Transition  | Standard      |

---

# Button States

## Default

```text
Background → Primary
Text       → Text Primary
```

## Hover

```text
Background → Primary Hover
```

## Loading

The button displays a spinner and changes its label:

```text
Signing in...
```

---

## Disabled

```html
disabled:opacity-70
disabled:cursor-not-allowed
```

The disabled state prevents multiple login submissions.

---

# Loading Spinner

The spinner is reused from the Forgot Password screen.

```html
<svg class="animate-spin h-5 w-5">
```

### Specifications

| Property  | Value        |
| --------- | ------------ |
| Size      | `20px`       |
| Animation | Spin         |
| Color     | Text Primary |
| State     | Loading      |

---

# Account Status Alerts

The login system includes two contextual feedback components.

---

## Unverified Account Alert

```html
<div
  class="
    bg-warning/10
    border
    border-warning
    text-warning
    text-sm
    rounded
    p-3
  "
>
```

### Semantic meaning

```text
WARNING
```

Used when:

> The user has an account but has not verified their email.

---

## Blocked Account Alert

```html
<div
  class="
    bg-error/10
    border
    border-error
    text-error
    text-sm
    rounded
    p-3
  "
>
```

### Semantic meaning

```text
ERROR
```

Used when:

> The account is temporarily blocked because of failed login attempts.

---

# Sign Up Navigation

```html
<p class="text-text-secondary text-sm">
  Don't have an account?

  <span class="text-accent font-semibold cursor-pointer hover:underline">
    Sign up
  </span>
</p>
```

### Hierarchy

```text
Don't have an account? → Secondary
Sign up                → Accent + Semibold
```

This creates a clear distinction between descriptive and interactive text.

---

# Remember Me

```html
<label
  class="
    flex
    items-center
    gap-2
    text-text-secondary
    text-sm
  "
>
```

### Structure

```text
[ ✓ ] Remember me
```

The checkbox uses the primary color:

```html
accent-primary
```

### Specifications

| Property | Value     |
| -------- | --------- |
| Text     | Secondary |
| Size     | `sm`      |
| Gap      | `8px`     |
| Accent   | Primary   |

---

# Border Radius System

| Token | Value | Usage                   |
| ----- | ----: | ----------------------- |
| `sm`  |   4px | Small elements          |
| `md`  |   8px | Inputs, buttons, alerts |
| `lg`  |  12px | Medium containers       |
| `xl`  |  16px | Larger components       |
| `2xl` |  24px | Authentication card     |

Current Login Page:

```text
Input       → md
Button      → md
Alerts      → md
Main Card   → 2xl / 3xl
```

---

# Spacing System

| Token | Value |
| ----- | ----: |
| `1`   |   4px |
| `2`   |   8px |
| `4`   |  16px |
| `6`   |  24px |
| `8`   |  32px |
| `10`  |  40px |

### Current usage

```text
Page padding      → 24px
Form gap          → 24px
Field gap         → 4px
Card padding      → 40px
Checkbox gap      → 8px
```

---

# Shadow System

The authentication card uses an elevated shadow.

```html
shadow-2xl shadow-primary/20
```

### Design intention

The shadow creates separation between the authentication card and the application background while subtly reinforcing the primary brand color.

---

# Component Inventory

## Page

* `LoginPage`

## Layout

* `AuthContainer`
* `AuthCard`
* `ImagePanel`
* `FormPanel`

## Form Components

* `EmailInput`
* `PasswordInput`
* `PasswordVisibilityToggle`
* `RememberMeCheckbox`
* `LoginButton`

## Navigation

* `ForgotPasswordLink`
* `SignUpLink`

## Feedback

* `UnverifiedAccountAlert`
* `BlockedAccountAlert`
* `LoadingSpinner`

---

# Authentication States

The Login Page can be represented as the following state system:

```text
                    LOGIN PAGE
                         │
          ┌──────────────┴──────────────┐
          │                             │
       Default                       Loading
          │                             │
          │                    ┌────────┴────────┐
          │                    │                 │
       Login                  Spinner        Disabled
          │
     ┌────┴─────┐
     │          │
  Success     Failure
                │
        ┌───────┴────────┐
        │                │
    Unverified         Blocked
      Warning           Error
```

---

# Interaction System

## Standard Transition

Interactive elements should use:

```html
transition
```

Recommended token:

```css
--duration-normal: 250ms;
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
```

---

# Accessibility

## Labels

Every input should have an associated label.

Recommended implementation:

```tsx
<label htmlFor="email">
  Email Address
</label>

<input
  id="email"
  type="email"
/>
```

And:

```tsx
<label htmlFor="password">
  Password
</label>

<input
  id="password"
  type="password"
/>
```

---

## Password Toggle

The visibility button should have an accessible label.

Recommended:

```tsx
<button
  type="button"
  aria-label={
    showPassword
      ? "Hide password"
      : "Show password"
  }
>
```

This ensures screen readers can understand the purpose of the icon-only control.

---

## Loading State

The current implementation correctly disables the form while submitting:

```tsx
disabled={isSubmitting}
```

This prevents duplicate authentication requests.

---

# Design System Relationship

The Login Page and Forgot Password Page share the same foundation.

```text
                 AUTH DESIGN SYSTEM
                        │
          ┌─────────────┴─────────────┐
          │                           │
      LOGIN PAGE               FORGOT PASSWORD
          │                           │
     ┌────┴────┐                 ┌────┴────┐
     │         │                 │         │
   Form      Alerts            Form      Success
     │                           │
     ├─ Email                    └─ Email
     ├─ Password
     ├─ Remember Me
     └─ Login
```

This means the tokens should be maintained **globally**, rather than creating separate color systems for each page.

---

# Recommended Authentication Design Tokens

For the complete authentication system, the core semantic tokens are:

```css
@theme {

  /* Brand */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-accent: #3b82f6;

  /* Feedback */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Surfaces */
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-variant: #f1f5f9;

  /* Borders */
  --color-border: #e2e8f0;

  /* Typography */
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-disabled: #94a3b8;

  /* Layout */
  --radius-md: 0.5rem;
  --radius-2xl: 1.5rem;

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 250ms;

  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```
 
