# Design System — Multicine

## Overview

Sistema de diseño basado en las vistas de autenticación oscuras de Multicine: `RegisterPage.tsx` y `RecoverPassword.tsx`, enfocado en simplicidad, agrupación clara por secciones y consistencia dimensional entre campos.
---

# Design Tokens

```css
@theme {

  /* ===========================================
     COLORS
  =========================================== */

  --color-background: #000000;

  --color-surface-card: rgb(0 0 0 / 0.6);           /* black/60 — contenedor del form */
  --color-surface-100: rgb(51 65 85 / 0.7);          /* slate-700/70 — inputs y selects */

  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D1D5DB;                   /* gray-300 */
  --color-text-placeholder: #9CA3AF;                 /* gray-400 */

  --color-primary: #EA580C;                          /* orange-600 */
  --color-primary-hover: #C2410C;                     /* orange-700 */
  --color-primary-light: #FB923C;                     /* orange-400 */

  --color-success: #22C55E;                           /* * */

  --color-warning-bg: rgba(120,53,15,.40);            /* * */
  --color-warning-border: #CA8A04;                     /* * */
  --color-warning-text: #FCD34D;                       /* * */

  --color-danger-bg: rgba(127,29,29,.40);             /* * */
  --color-danger-border: #DC2626;                      /* * */
  --color-danger-text: #FCA5A5;                        /* * */

  /* ===========================================
     TYPOGRAPHY
  =========================================== */

  --font-sans: Inter, ui-sans-serif, system-ui;        /* * — no declarada en el archivo, se asume default */

  --text-xs: .75rem;
  --text-sm: .875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;                                /* usado en el título de RecoverPassword — ver Inconsistencias */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --tracking-wide: .05em;

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
  --spacing-3xl: 2.5rem;                                /* usado como padding del form en RecoverPassword (p-10) — ver Inconsistencias */

  /* ===========================================
     BORDER RADIUS
  =========================================== */

  --radius-sm: .25rem;    /* rounded — inputs, botón */
  --radius-lg: .5rem;     /* rounded-lg — tarjeta del form */

  /* ===========================================
     SIZE
  =========================================== */

  --input-height: 3rem;
  --button-height: 3rem;
  --form-width: 32rem;    /* max-w-lg — RegisterPage */
  --form-width-sm: 28rem; /* max-w-md — RecoverPassword, ver Inconsistencias */

  /* ===========================================
     EFFECTS
  =========================================== */

  --blur-card: 4px;       /* backdrop-blur-sm */

  --ring-primary: var(--color-primary);

  /* ===========================================
     TRANSITIONS
  =========================================== */

  --ease-default: cubic-bezier(.4,0,.2,1);
  --duration-normal: 200ms;
}
```

---

# Color Palette

| Token | Value | Usage |
|--------|-------|-------|
| background | #000000 | Fondo de la vista |
| surface-card | black/60 | Contenedor del formulario |
| surface-100 | slate-700/70 | Inputs y selects |
| primary | orange-600 | Botón "Continue" |
| primary-hover | orange-700 | Hover del botón |
| primary-light | orange-400 | Títulos de sección, enlace "Sign in" |
| text-primary | white | Título, valores de campo |
| text-secondary | gray-300 | Labels, texto de pie |
| placeholder | gray-400 | Placeholders, íconos de contraseña |
| success * | green | Confirmaciones (no implementado aún) |
| warning * | yellow | Verificación pendiente (no implementado aún) |
| danger * | red | Errores de validación, cuenta bloqueada (no implementado aún) |

---

# Typography

## Heading

- Size: 24px (`text-2xl`)
- Weight: 700
- Color: White
- Uso: "Create account" (`RegisterPage.tsx`)

## Heading — variante grande ⚠

- Size: 30px (`text-3xl`)
- Weight: 700
- Color: White
- Margin: `mb-2`
- Uso: "Get the password" (`RecoverPassword.tsx`)
- Nota: mismo rol semántico que el Heading anterior (título principal del formulario) pero con tamaño distinto. Ver Inconsistencias.

## Section Title

- Size: 14px (`text-sm`)
- Weight: 600
- Transform: uppercase
- Tracking: wide
- Color: primary-light
- Uso: "Personal Information", "Contact", "Security", "Preferences"

## Body

- Size: 14px (`text-sm`)
- Weight: 400
- Uso: texto de pie ("Already have an account?")

## Small

- Size: 12px (`text-xs`)
- Used for:
    - labels de campo individual ("Date of Birth", "Gender (optional)") en `RegisterPage.tsx`

## Label ⚠

- Size: 14px (`text-sm`)
- Color: White (no `text-secondary`)
- Uso: "Email:", "User:" (`RecoverPassword.tsx`)
- Nota: mismo rol que "Small" de arriba (etiqueta de campo) pero con tamaño y color distintos. Ver Inconsistencias.

---

# Spacing Scale

| Token | Size |
|--------|------|
| xs | 4px |
| sm | 8px |
| md | 12px — separación entre campos de un mismo grupo |
| lg | 16px |
| xl | 24px — separación entre bloques del formulario |
| 2xl | 32px — padding interno del contenedor (RegisterPage, `p-8`) |
| 3xl | 40px — padding interno del contenedor (RecoverPassword, `p-10`) ⚠ |

---

# Components

## Button

Primary

Properties

- Height: 48px
- Radius: 4px
- Background: primary
- Text: White
- Font Weight: Bold

States

- Default
- Hover
- Disabled *
- Loading *

---

## Text Input

Properties

- Height: 48px
- Radius: 4px
- Background: surface-100
- Text: White
- Placeholder: gray

States

- Default
- Focus (ring 2px, primary)
- Filled
- Error * (no implementado — se propone ring/borde en danger-border)
- Disabled *

---

## Select

Contains

- Mismas propiedades visuales que Text Input
- Usado en: Document Type, Gender, Main City, Favorite Complex

States

- Default
- Focus
- Disabled *

---

## Password Field

Contains

- Input
- Visibility Toggle Button (ícono absoluto, `right-3 top-3.5`, color placeholder)

States

- Hidden
- Visible

---

## Alert *

No implementado en `RegisterPage.tsx`; se documenta como extensión propuesta para reutilizar en verificación de correo o bloqueo de cuenta.

### Warning

- Yellow background
- Yellow border
- Yellow text

Used for

- Correo pendiente de verificación

### Danger

- Red background
- Red border
- Red text

Used for

- Error de validación de formulario

---

## Links

Color

primary-light

Examples

- "Sign in" (pie del formulario, `RegisterPage.tsx`)

---

## Divider

Properties

- Text: "o"
- Color: text-primary (white)
- Size: 14px (`text-sm`)
- Alignment: center

Uso

- Separar dos métodos alternativos de identificación (Email / User) en `RecoverPassword.tsx`

Nota ⚠

- Es texto plano, no un componente con línea horizontal (`<hr>` o pseudo-elemento). Se documenta tal cual está implementado; si se requiere un divisor visual más robusto (línea + texto centrado), es una extensión pendiente.

---

# Layout

Register Layout

```
Viewport
│
├── Background (black)
│
└── Center Container
      │
      └── Form (max-w-lg)
            ├── Title
            ├── Section: Personal Information
            │     ├── First Name / Last Name
            │     ├── Document Type / Document Number
            │     └── Date of Birth / Gender
            ├── Section: Contact
            │     ├── Email
            │     ├── Confirm Email
            │     └── Phone
            ├── Section: Security
            │     ├── Password (con toggle)
            │     └── Confirm Password
            ├── Section: Preferences
            │     ├── Main City
            │     └── Favorite Complex
            ├── Submit Button
            └── Sign In Link
```

Maximum Width

512px (`max-w-lg`)

Alignment

Centrado horizontal y verticalmente

---

Recover Password Layout

```
Viewport
│
├── Background (black)
│
└── Center Container
      │
      └── Form (max-w-md, bg-transparent) ⚠
            ├── Title ("Get the password")
            ├── Email Field
            ├── Divider ("o")
            ├── User Field
            └── Submit Button ("Actualizar contraseña")
```

Maximum Width

448px (`max-w-md`) ⚠ — distinto al de `RegisterPage.tsx` (512px)

Alignment

Centrado horizontal y verticalmente

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

- Anillo de foco visible
- Área táctil mínima de 48px en todos los controles
- Contraste alto entre texto y fondo
- Labels asociados a campos con contexto adicional (Date of Birth, Gender)
- Controles accesibles por teclado (inputs y selects nativos)
- Toggle de visibilidad de contraseña — pendiente agregar `aria-label` dinámico según estado *
- `RecoverPassword.tsx`: los `<label>` ("Email:", "User:") no están asociados a su `<input>` mediante `htmlFor`/`id`; se recomienda agregar esta asociación explícita para lectores de pantalla.
- `RecoverPassword.tsx`: el separador "o" es texto plano sin rol semántico (`aria-hidden` no aplicado ni tampoco necesario si se interpreta como contenido informativo, pero conviene revisarlo).

 
 