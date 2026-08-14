[⬅ Volver al índice](./README.md)

# 15 — Design Tokens

Esta es la tabla de referencia técnica: cada fila es una variable de diseño (token) lista para implementarse como variable CSS, variable de Tailwind/theme, o Variable de Figma. El **nombre del token nunca cambia entre modos**; lo único que cambia es su valor.

> Naming convention: `--categoría-nombre` (ej. `--color-background`, `--spacing-4`, `--radius-lg`). No usamos escalas numéricas tipo `50–900` porque el sistema es semántico por token (cada nombre ya indica su uso), no una escala de intensidad de un mismo color.

## Color

| Token                     | Light     | Dark      | Uso                                            |
| ------------------------- | --------- | --------- | ---------------------------------------------- |
| `--color-background`      | `#F7F8FC` | `#0A0B10` | Fondo base de toda la aplicación               |
| `--color-surface`         | `#FFFFFF` | `#13151C` | Tarjetas, contenedores, secciones              |
| `--color-surface-variant` | `#EEF0F6` | `#1C1F29` | Elementos anidados, inputs, filas activas      |
| `--color-primary`         | `#5B5FEF` | `#5B5FEF` | Botones principales, links activos             |
| `--color-primary-hover`   | `#4A4DD1` | `#7477F5` | Hover/active de elementos primarios            |
| `--color-secondary`       | `#6B7280` | `#8B8FA3` | Botones secundarios, elementos de apoyo        |
| `--color-accent`          | `#0F9C86` | `#2CE0C1` | Highlights puntuales, badges destacados        |
| `--color-success`         | `#1E9E63` | `#3DD68C` | Confirmaciones, disponibilidad                 |
| `--color-warning`         | `#B57516` | `#E8A83C` | Últimos asientos, avisos no críticos           |
| `--color-error`           | `#D93F52` | `#EF5B6B` | Errores de formulario, pagos fallidos          |
| `--color-info`            | `#2B7FD6` | `#4EA1F5` | Mensajes informativos, tooltips                |
| `--color-text-primary`    | `#101217` | `#F5F6FA` | Titulares, texto principal                     |
| `--color-text-secondary`  | `#4B4F5C` | `#A2A6B8` | Subtítulos, descripciones, metadatos           |
| `--color-text-disabled`   | `#9CA0AC` | `#5B5E6D` | Texto inactivo, placeholders                   |
| `--color-border`          | `#E1E4EC` | `#272B36` | Contornos de inputs, tarjetas, botones outline |
| `--color-divider`         | `#ECEEF3` | `#1D202A` | Líneas separadoras entre secciones             |

## Tipografía

| Token                     | Light             | Dark              | Uso                             |
| ------------------------- | ----------------- | ----------------- | ------------------------------- |
| `--font-family-primary`   | `"Space Grotesk"` | `"Space Grotesk"` | Titulares, botones, marca       |
| `--font-family-secondary` | `"General Sans"`  | `"General Sans"`  | Texto de lectura, descripciones |
| `--font-size-display`     | `57px`            | `57px`            | Hero de landing                 |
| `--font-size-headline`    | `40px`            | `40px`            | Títulos de sección              |
| `--font-size-title`       | `28px`            | `28px`            | Encabezados de tarjetas         |
| `--font-size-subtitle`    | `20px`            | `20px`            | Subtítulos, listas              |
| `--font-size-body`        | `16px`            | `16px`            | Texto general                   |
| `--font-size-caption`     | `13px`            | `13px`            | Metadatos, etiquetas            |
| `--font-size-overline`    | `11px`            | `11px`            | Estados, categorías             |
| `--font-weight-regular`   | `400`             | `400`             | Texto general                   |
| `--font-weight-medium`    | `500`             | `500`             | Subtítulos, botones             |
| `--font-weight-semibold`  | `600`             | `600`             | Títulos, overline               |
| `--font-weight-bold`      | `700`             | `700`             | Headline, Display               |

> Los valores de line-height y letter-spacing por nivel están detallados en [04 — Tipografía](./04-tipografia.md); no varían entre Light y Dark.

## Espaciado

| Token          | Light   | Dark    | Uso                                            |
| -------------- | ------- | ------- | ---------------------------------------------- |
| `--spacing-1`  | `4px`   | `4px`   | Separación mínima                              |
| `--spacing-2`  | `8px`   | `8px`   | Padding interno reducido                       |
| `--spacing-3`  | `12px`  | `12px`  | Padding estándar en componentes pequeños       |
| `--spacing-4`  | `16px`  | `16px`  | Padding base de tarjetas y formularios         |
| `--spacing-5`  | `24px`  | `24px`  | Separación entre bloques dentro de una sección |
| `--spacing-6`  | `32px`  | `32px`  | Padding de secciones medianas                  |
| `--spacing-7`  | `48px`  | `48px`  | Separación entre secciones principales         |
| `--spacing-8`  | `64px`  | `64px`  | Márgenes de sección en desktop                 |
| `--spacing-9`  | `96px`  | `96px`  | Separación entre bloques editoriales grandes   |
| `--spacing-10` | `128px` | `128px` | Márgenes de página en layouts amplios          |

## Border Radius

| Token           | Light   | Dark    | Uso                                    |
| --------------- | ------- | ------- | -------------------------------------- |
| `--radius-xs`   | `4px`   | `4px`   | Badges, chips pequeños, checkboxes     |
| `--radius-sm`   | `8px`   | `8px`   | Inputs, botones pequeños, tags         |
| `--radius-md`   | `12px`  | `12px`  | Botones estándar, campos de formulario |
| `--radius-lg`   | `16px`  | `16px`  | Tarjetas de contenido                  |
| `--radius-xl`   | `24px`  | `24px`  | Modales, contenedores grandes          |
| `--radius-full` | `999px` | `999px` | Avatares, píldoras, indicadores        |

## Elevación (sombra)

| Token         | Light                            | Dark                             | Uso                                           |
| ------------- | -------------------------------- | -------------------------------- | --------------------------------------------- |
| `--shadow-xs` | `0px 1px 2px rgba(0,0,0,0.10)`   | `0px 1px 2px rgba(0,0,0,0.16)`   | Elementos ligeramente elevados (chips, focus) |
| `--shadow-sm` | `0px 2px 6px rgba(0,0,0,0.12)`   | `0px 2px 6px rgba(0,0,0,0.20)`   | Tarjetas en reposo                            |
| `--shadow-md` | `0px 4px 12px rgba(0,0,0,0.14)`  | `0px 4px 12px rgba(0,0,0,0.24)`  | Tarjetas en hover, dropdowns                  |
| `--shadow-lg` | `0px 8px 24px rgba(0,0,0,0.16)`  | `0px 8px 24px rgba(0,0,0,0.28)`  | Popovers, menús contextuales                  |
| `--shadow-xl` | `0px 16px 40px rgba(0,0,0,0.18)` | `0px 16px 40px rgba(0,0,0,0.32)` | Modales, diálogos de confirmación             |

## Opacidad

| Token                | Light | Dark  | Uso                                          |
| -------------------- | ----- | ----- | -------------------------------------------- |
| `--opacity-hover`    | `8%`  | `8%`  | Overlay sutil en hover                       |
| `--opacity-active`   | `12%` | `12%` | Overlay al presionar/activar                 |
| `--opacity-disabled` | `40%` | `40%` | Elementos deshabilitados                     |
| `--opacity-overlay`  | `64%` | `64%` | Fondo detrás de modales y drawers            |
| `--opacity-scrim`    | `72%` | `72%` | Overlay sobre imágenes con texto superpuesto |

## Animación

| Token                 | Light                       | Dark                        | Uso                    |
| --------------------- | --------------------------- | --------------------------- | ---------------------- |
| `--duration-instant`  | `100ms`                     | `100ms`                     | Micro-feedback         |
| `--duration-fast`     | `150ms`                     | `150ms`                     | Componentes pequeños   |
| `--duration-base`     | `200ms`                     | `200ms`                     | Transiciones estándar  |
| `--duration-moderate` | `300ms`                     | `300ms`                     | Componentes medianos   |
| `--duration-slow`     | `400ms`                     | `400ms`                     | Transiciones de layout |
| `--easing-standard`   | `cubic-bezier(0.4,0,0.2,1)` | `cubic-bezier(0.4,0,0.2,1)` | Transiciones generales |

## Ejemplo de implementación en CSS

```css
:root {
  --color-background: #f7f8fc;
  --color-surface: #ffffff;
  --color-primary: #5b5fef;
  --color-text-primary: #101217;
  --spacing-4: 16px;
  --radius-lg: 16px;
}

[data-theme="dark"] {
  --color-background: #0a0b10;
  --color-surface: #13151c;
  --color-primary: #5b5fef;
  --color-text-primary: #f5f6fa;
}
```

## Ejemplo de implementación en Figma

Crear una **Collection de Variables** llamada `design-tokens`, con dos **Modes**: `Light` y `Dark`. Cada fila de las tablas anteriores se convierte en una variable dentro de esa colección, con su valor correspondiente por modo. Los componentes se enlazan siempre a la variable (nunca a un valor fijo), permitiendo alternar de tema con un clic.

---
