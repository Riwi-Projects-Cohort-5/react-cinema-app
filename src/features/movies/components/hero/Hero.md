# Hero

Contenedor principal del carrusel de películas destacadas que gestiona el autoplay, estado activo y la navegación.

## Estructura

Sección `<section>` con `min-h-[520px]` que combina viewport visual y banda de controles inferior.

## Props

No expone props públicas. Utiliza `useMovies` y `useHeroCarousel` internamente.

## Interfaz de QA

- `data-carousel-state`: Estado de reproducción ("playing" | "paused").
- `data-active-index`: Índice del slide actual.

## Accesibilidad (ARIA)

- `role="region"` y `aria-roledescription="carrusel"`.
- Flechas con `aria-label` para navegación.

## Estados de Datos

Logra estados de carga (skeleton), error (con reintento), vacío y poblado.

## Referencias de diseño
- Implementación RON-05 basada en `MULT-157.xml`.
- Alturas gestionadas según `docs/design/12-grid.md`.
