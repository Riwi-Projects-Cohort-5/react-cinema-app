[← Volver al índice](./README.md)

# 12 — Sistema de Grid

## Principio

El grid es la estructura invisible que da ritmo a cada pantalla. React Cinema App usa un sistema de columnas fluidas con gutters fijos, pensado para acomodar desde cards de películas en móvil hasta layouts editoriales en desktop. El contenedor nunca toca los bordes de la pantalla — siempre respira.

---

## Breakpoints y configuración de columnas

| Breakpoint | Nombre   | Rango px      | Columnas | Gutter | Margen lateral | Ancho máx. contenedor |
| ---------- | -------- | ------------- | -------- | ------ | --------------- | ---------------------- |
| `xs`       | Mobile S | 0 – 359px     | 4        | 16px   | 16px            | 100%                   |
| `sm`       | Mobile   | 360 – 767px   | 4        | 16px   | 20px            | 100%                   |
| `md`       | Tablet   | 768 – 1023px  | 8        | 24px   | 32px            | 100%                   |
| `lg`       | Desktop  | 1024 – 1279px | 12       | 24px   | 40px            | 1240px                 |
| `xl`       | Wide     | 1280 – 1535px | 12       | 32px   | 48px            | 1440px                 |
| `2xl`      | Ultra    | 1536px+       | 12       | 32px   | auto (centrado) | 1600px                 |

---

## Tipos de contenedor

### `container-fluid`
Ocupa el 100% del ancho disponible respetando los márgenes laterales del breakpoint activo. Usado para fondos, heroes y secciones edge-to-edge.

### `container`
Contenedor con ancho máximo centrado. Estándar para contenido editorial y listados.

### `container-narrow`
Para contenido textual largo (sinopsis, bios de director). Máximo 720px, centrado.

---

## Layouts más usados

### Grid de cards

| Breakpoint | Columnas |
| ---------- | -------- |
| `xs / sm`  | 2        |
| `md`       | 3        |
| `lg`       | 4        |
| `xl / 2xl` | 5 – 6    |

### Detalle de película


En tablet, el póster va encima del bloque de info (stacked).

### Hero

| Breakpoint | Altura mínima |
| ---------- | ------------- |
| `sm`       | 480px         |
| `md`       | 560px         |
| `lg+`      | 640px         |

---

## Reglas de uso

1. Nunca usar columnas impares en layouts de cards.
2. El gutter entre cards usa `--spacing-4` en móvil y `--spacing-5` en desktop.
3. Elementos full-bleed usan `container-fluid` o margin negativo si están dentro de `container`.
4. Sidebar de filtros solo en `lg+`. En inferiores va en drawer o panel colapsable.