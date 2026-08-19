[← Volver al índice](./README.md)

# 13 — Responsive Foundations

## Principio

React Cinema App es **mobile-first**: los estilos base se escriben para móvil y se sobreescriben hacia arriba. Nunca al revés.

---

## Breakpoints oficiales

| Token  | Valor  | Equivalente Tailwind |
| ------ | ------ | -------------------- |
| `xs`   | 360px  | `sm`                 |
| `md`   | 768px  | `md`                 |
| `lg`   | 1024px | `lg`                 |
| `xl`   | 1280px | `xl`                 |
| `2xl`  | 1536px | `2xl`                |

---

## Metodología mobile-first

```css
.movie-card { flex-direction: column; }

@media (min-width: 768px) {
  .movie-card { flex-direction: row; }
}


.movie-card { flex-direction: row; }

@media (max-width: 767px) {
  .movie-card { flex-direction: column; }
}
```

---

## Comportamiento por componente

| Componente | Mobile | Desktop |
| ---------- | ------ | ------- |
| Navbar | Logo + hamburger → drawer | Links horizontales + búsqueda |
| Hero | Imagen arriba, info abajo | Imagen full-bleed + info superpuesta |
| Grid de películas | 2 columnas | 4 – 5 columnas |
| Detalle de película | Stacked | Sidebar 5/7 cols |
| Modal | Full-screen | Centrado, máx. 900px |
| Filtros | Bottom sheet o drawer | Sidebar fija |

---

## Reglas de uso

1. Todo componente se diseña primero para `xs` (360px), luego se escala.
2. Usar siempre `min-width`, nunca `max-width`.
3. No crear breakpoints fuera de los 5 oficiales.
4. Touch targets mínimos de 44×44px en móvil.