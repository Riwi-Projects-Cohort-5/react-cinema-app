# Feature Hero Carousel / Cartelera (`src/features/movies/`)

## Descripción

Feature principal de la cartelera dinámica y carrusel de películas destacadas.
Implementación bajo la historia MULT-221 HU-FE-003.2.

## Módulos

| Módulo | Ruta | Descripción |
| :--- | :--- | :--- |
| [Interfaces](./interfaces/movie.ts) | `interfaces/movie.ts` | Contrato de datos `Movie`. |
| [Servicio](./services/movies.service.ts) | `services/movies.service.ts` | Consumo de datos de películas. |
| [Hook `useMovies`](./hooks/useMovies.ts) | `hooks/useMovies.ts` | Hook de acceso a los datos de películas (TanStack Query). |
| [Hook `useHeroCarousel`](./hooks/useHeroCarousel.ts) | `hooks/useHeroCarousel.ts` | Lógica de control del carrusel (autoplay, navegación, progreso). |
| [Hero](./components/hero/Hero.tsx) | `components/hero/Hero.tsx` | Contenedor principal del carrusel de héroe. |
| [HeroSlideContent](./components/hero/HeroSlideContent.tsx) | `components/hero/HeroSlideContent.tsx` | Contenido de una diapositiva activa. |
| [TrailerLightbox](./components/hero/TrailerLightbox.tsx) | `components/hero/TrailerLightbox.tsx` | Ventana modal para visualización de tráilers. |
| [HeroProgress](./components/hero/HeroProgress.tsx) | `components/hero/HeroProgress.tsx` | Indicadores de progreso y control del carrusel. |
| [HomePage](./pages/HomePage.tsx) | `pages/HomePage.tsx` | Página de inicio de la feature. |
| [Utils](./utils/index.ts) | `utils/index.ts` | Utilidades de formateo. |

Importación recomendada desde los barrels de la feature:

```tsx
import { useHeroCarousel, useMovies } from "@features/movies/hooks";
import { Hero } from "@features/movies/components/hero";
import { ... } from "@features/movies/utils";
```

## Token Audit — Hero Section

| Visual Element | CSS Token/Class | Source Document |
|---|---|---|
| Section background | `bg-background` | `docs/design/03-colores.md` |
| Slide surface | `bg-surface`, `bg-surface-variant` | `docs/design/03-colores.md` |
| Primary text | `text-text-primary` | `docs/design/03-colores.md` |
| Secondary text | `text-text-secondary` | `docs/design/03-colores.md` |
| Disabled text | `text-text-disabled` | `docs/design/03-colores.md` |
| Active/accent | `bg-accent`, `text-accent`, `border-accent` | `docs/design/03-colores.md` |
| Warning | `text-warning`, `bg-warning` | `docs/design/03-colores.md` |
| Title font | `font-primary` (Space Grotesk) | `docs/design/04-tipografia.md` |
| Body font | `font-secondary` (General Sans/Inter) | `docs/design/04-tipografia.md` |
| Hero H1 size | `text-4xl lg:text-5xl font-bold` | `docs/design/04-tipografia.md` |
| Overlay gradient | `bg-gradient-to-r from-background/88 via-background/52 to-transparent` | `docs/design/09-opacidad.md` |
| Bottom fade | `bg-gradient-to-b from-transparent to-background/52` | `docs/design/09-opacidad.md` |
| Arrow shadow | `shadow-xl` | `docs/design/07-elevacion.md` |
| Arrow radius | `rounded-full` | `docs/design/08-bordes.md` |
| Badge radius | `rounded-md` | `docs/design/08-bordes.md` |
| Hero outer radius | NONE (no `rounded-[1.25rem]`) | `docs/design/08-bordes.md` |
| Slide transition | `transition-transform duration-500 ease-in-out` | `docs/design/14-animaciones.md` |
| Reduced motion | `motion-reduce:transition-none` | `docs/design/14-animaciones.md` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` | `docs/design/15-accesibilidad.md` |
| Autoplay interval | 5000ms | `docs/design/14-animaciones.md` |
