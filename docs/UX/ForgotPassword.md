# Forgot Password Page — Design System Documentation

## Overview

This design system was reverse-engineered from the `ForgotPasswordPage` component and converted into a scalable **Tailwind CSS v4 token architecture** using the `@theme` directive.

---

# Design Principles

### Goals

* Clear authentication experience
* Strong visual hierarchy
* Accessible form controls
* Consistent spacing system
* Reusable semantic color tokens
* Dark mode ready

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

Used for:

* Main CTA buttons
* Focus rings
* Active states

| Token         | Value   |
| ------------- | ------- |
| Primary       | #2563eb |
| Primary Hover | #1d4ed8 |

---

## Accent

Used for:

* Text links
* Secondary actions
* Interactive highlights

| Token  | Value   |
| ------ | ------- |
| Accent | #3b82f6 |

---

## Success

Used for:

* Confirmation messages
* Success alerts
* Positive feedback

| Token   | Value   |
| ------- | ------- |
| Success | #22c55e |

---

## Surface Colors

| Token           | Usage          |
| --------------- | -------------- |
| Background      | App background |
| Surface         | Cards          |
| Surface Variant | Inputs         |

```txt
Background → #f8fafc
Surface → #ffffff
Surface Variant → #f1f5f9
```

---

## Text Colors

| Token          | Usage           |
| -------------- | --------------- |
| Text Primary   | Headlines       |
| Text Secondary | Supporting text |
| Text Disabled  | Placeholder     |

```txt
Primary → #0f172a
Secondary → #64748b
Disabled → #94a3b8
```

---

# Typography

## Heading

```html
<h1 class="text-3xl font-bold">
```

### Usage

* Page titles
* Authentication screens

---

## Body

```html
<p class="text-sm text-text-secondary">
```

### Usage

* Descriptions
* Supporting copy
* Instructions

---

## Labels

```html
<label class="text-sm text-text-primary">
```

### Usage

* Form fields

---

# Layout System

## Main Page Container

```html
<div class="min-h-screen flex items-center justify-center p-6">
```

### Responsibilities

* Full viewport height
* Centered content
* Responsive spacing

---

## Authentication Card

```html
<div class="max-w-5xl rounded-3xl shadow-2xl">
```

### Characteristics

| Property  | Value    |
| --------- | -------- |
| Max Width | 80rem    |
| Radius    | 24px     |
| Shadow    | Elevated |

---

# Grid Structure

Desktop:

```txt
┌──────────────┬──────────────┐
│              │              │
│    IMAGE     │    FORM      │
│              │              │
└──────────────┴──────────────┘
```

Mobile:

```txt
┌──────────────┐
│              │
│    FORM      │
│              │
└──────────────┘
```

Image hidden below:

```css
md < 768px
```

---

# Form Components

## Input

### Anatomy

```html
<input
 class="
  bg-surface-variant
  border-border
  rounded
  focus:ring-primary
 "
/>
```

### States

#### Default

```txt
Surface Variant Background
Border
```

#### Focus

```txt
2px Primary Ring
Primary Border
```

#### Disabled

```txt
60% opacity
```

---

## Button

### Primary CTA

```html
<button
 class="
  bg-primary
  hover:bg-primary-hover
  rounded
 "
>
```

### States

| State    | Behavior      |
| -------- | ------------- |
| Default  | Primary       |
| Hover    | Primary Hover |
| Loading  | Spinner       |
| Disabled | Opacity 70%   |

---

# Feedback Components

## Success Alert

```html
<div class="bg-success/10 border-success">
```

### Usage

Password reset confirmation.

### Content

```txt
If an account exists...
```

---

# Loading State

## Spinner

```html
<svg class="animate-spin">
```

### Properties

| Property  | Value             |
| --------- | ----------------- |
| Size      | 20px              |
| Animation | Infinite Rotation |
| Color     | Text Primary      |

---

# Border Radius Scale

| Token | Value |
| ----- | ----- |
| sm    | 4px   |
| md    | 8px   |
| lg    | 12px  |
| xl    | 16px  |
| 2xl   | 24px  |

Used in this page:

```txt
Input → md
Alert → md
Button → md
Card → 2xl
```

---

# Spacing Scale

| Token | Value |
| ----- | ----- |
| 1     | 4px   |
| 2     | 8px   |
| 4     | 16px  |
| 6     | 24px  |
| 8     | 32px  |
| 10    | 40px  |

Current usage:

```txt
Page Padding → 24px
Card Padding → 40px
Form Gap → 24px
Field Gap → 4px
```

---

# Component Inventory

### Page

* ForgotPasswordPage

### Layout

* AuthContainer
* AuthCard
* ImagePanel
* FormPanel

### Forms

* EmailField
* PrimaryButton

### Feedback

* SuccessAlert
* LoadingSpinner

### Navigation

* BackToLoginLink

---

# Accessibility

### Input

```html
<label for="email">
```

Recommended improvement:

```tsx
<label htmlFor="email">
<input id="email" />
```

---

### Focus Visibility

Current:

```html
focus:ring-2
focus:ring-primary
```

✅ Accessible

---

### Loading State

Current:

```tsx
disabled={isSubmitting}
```

✅ Prevents duplicate submissions

---

# Design Summary

The page follows a modern authentication pattern based on:

* Semantic color tokens
* Elevated card layout
* Responsive split-screen design
* Clear primary CTA hierarchy
* Accessible focus states
* Tailwind v4 token architecture
* Reusable form and feedback components

This can serve as the foundation for a complete authentication design system including Login, Register, Forgot Password, Reset Password, Verify Email, and Two-Factor Authentication screens.
