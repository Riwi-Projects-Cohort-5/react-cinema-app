[← Volver al índice](./README.md)

# 15 — Accesibilidad

## Principio

React Cinema App apunta al nivel **WCAG 2.2 AA** como mínimo. La accesibilidad no es una capa que se añade al final — es una restricción de diseño que moldea cada componente desde el inicio.

---

## Contraste de color

| Tipo de texto                        | Ratio mínimo |
| ------------------------------------ | ------------ |
| Texto normal (< 18px)                | 4.5 : 1      |
| Texto grande (≥ 18px bold o ≥ 24px)  | 3 : 1        |
| Componentes UI (bordes, íconos)      | 3 : 1        |

### Pares validados

| Elemento              | Texto          | Fondo          | Ratio    |
| --------------------- | -------------- | -------------- | -------- |
| Texto primario        | `#F5F6FA`      | `#0A0B10`      | ~15 : 1  |
| Texto secundario      | `#A2A6B8`      | `#0A0B10`      | ~4.6 : 1 |
| Sobre primario        | `#FFFFFF`      | `#5B5FEF`      | ~4.6 : 1 |
| Sobre acento          | `#0A0B10`      | `#2CE0C1`      | ~9.2 : 1 |

---

## Semántica HTML

- Un solo `<h1>` por página. No saltar niveles de encabezado.
- Landmarks obligatorios: `<header>`, `<nav>`, `<main>`, `<footer>`.
- Modales usan `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.

---

## Navegación por teclado

- Orden de tab siguiendo el flujo visual: izquierda a derecha, arriba a abajo.
- Nunca usar `tabindex > 0`.
- Skip link obligatorio en todas las páginas:

```html
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>
```

- Los modales deben atrapar el foco mientras están abiertos y devolverlo al cerrarse.

---

## Imágenes y medios

| Contexto                     | Regla                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| Póster de película           | `alt="Póster de [Título]"`                                   |
| Imagen decorativa            | `alt=""` (vacío, no omitir)                                  |
| Ícono funcional sin texto    | `aria-label` en el botón, ícono con `aria-hidden="true"`     |
| Video / trailer              | Subtítulos obligatorios. Autoplay solo con `muted`.          |

---

## Roles ARIA por componente

| Componente    | ARIA requerido                                                        |
| ------------- | --------------------------------------------------------------------- |
| Modal         | `role="dialog"` `aria-modal="true"` `aria-labelledby="modal-title"`  |
| Dropdown      | `role="menu"` + items con `role="menuitem"`                           |
| Tabs          | `role="tablist"` > `role="tab"` + `aria-selected` + `role="tabpanel"`|
| Toast         | `role="status"` (info) o `role="alert"` (error)                       |
| Skeleton      | `aria-busy="true"` + `aria-label="Cargando..."`                       |

---

## Checklist antes de PR

- [ ] Contraste ≥ 4.5:1 en texto normal, ≥ 3:1 en texto grande y UI
- [ ] Un solo `<h1>` por página, sin saltos de nivel
- [ ] Todo elemento interactivo alcanzable y operable con teclado
- [ ] Focus visible en todos los estados `:focus-visible`
- [ ] Imágenes con `alt` adecuado
- [ ] Modales con trampa de foco
- [ ] Skip link presente
- [ ] `prefers-reduced-motion` implementado