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
