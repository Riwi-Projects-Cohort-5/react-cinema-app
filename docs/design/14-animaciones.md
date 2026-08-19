[← Volver al índice](./README.md)

# 14 — Animaciones

## Principio

Las animaciones en React Cinema App son **funcionales y contenidas**. El movimiento confirma acciones, orienta al usuario y añade carácter sin distraer. Ninguna animación existe puramente como decoración.

---

## Duraciones

| Token                | Valor  | Uso                                          |
| -------------------- | ------ | -------------------------------------------- |
| `--duration-instant` | 100ms  | Cambios sin transición, estado disabled      |
| `--duration-fast`    | 150ms  | Hover de color, focus ring, tooltip          |
| `--duration-base`    | 200ms  | Menú, dropdown, modal fade                   |
| `--duration-moderate`| 300ms  | Entrada de sidebar, drawer, card expand      |
| `--duration-slow`    | 400ms  | Animaciones de página, primera carga         |

---

## Curvas de easing

| Token                | Valor                          | Uso                              |
| -------------------- | ------------------------------ | -------------------------------- |
| `--easing-standard`  | `cubic-bezier(0.4, 0, 0.2, 1)` | Transiciones generales           |
| `--easing-decelerate`| `cubic-bezier(0, 0, 0.2, 1)`  | Elementos que entran a pantalla  |
| `--easing-accelerate`| `cubic-bezier(0.4, 0, 1, 1)`  | Elementos que salen              |

---

## Animaciones principales

### Hover de card
```css
.movie-card {
  transition: transform var(--duration-fast) var(--easing-standard),
              box-shadow var(--duration-fast) var(--easing-standard);
}
.movie-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-lg);
}
```

### Entrada de modal
```css
.modal-overlay { animation: fadeIn var(--duration-base) var(--easing-decelerate); }
.modal-panel   { animation: slideUp var(--duration-moderate) var(--easing-decelerate); }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Skeleton loader
```css
.skeleton {
  background: linear-gradient(90deg,
    var(--color-surface-variant) 25%,
    var(--color-surface) 50%,
    var(--color-surface-variant) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
```

---

## Reduced motion

Obligatorio en todos los archivos CSS que definan animaciones:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Reglas de uso

1. Cada animación comunica algo concreto: entrada, salida, confirmación, carga. Si no comunica nada, no existe.
2. Preferir duraciones cortas y easing bien elegido sobre duraciones largas.
3. Usar `@media (hover: hover)` para que el hover no se quede pegado en touch.
4. No acumular animaciones: si el contenedor ya tiene transición, los hijos no deben tener la suya simultáneamente.