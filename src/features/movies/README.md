# Feature Hero Carousel / Cartelera (`src/features/movies/`)

## Descripción

Feature principal de la cartelera dinámica y carrusel de películas destacadas.
Implementación bajo la historia MULT-221 HU-FE-003.2.

## Modelo del Héroe

El héroe es una sección a pantalla completa (full-bleed), no una tarjeta.
- **Sin cartel**: Se usa `getBackdropUrl()` para renderizar el póster como fondo CSS. No hay ninguna etiqueta `<img>` adicional para pósteres.
- **Estructura**: Un contendor base `<section>` con banda de controles inferior.

## Contrato de Activos

- **Producción**: `bannerUrl` usada como backdrop del héroe (w=1200); `imageUrl` para miniaturas (w=800).
- **QA (Fixture)**: Usar `src/assets/hero.png` para pruebas visuales en caso de fallo de datos.

## Tabla de Geometría (SVG Referencia)

| Elemento | Valor / Descripción |
|---|---|
| Frame Viewport | 1846×608 |
| Viewport Visual | altura 520px |
| Región controles | altura 88px |
| Diapositiva Activa | 1251px ancho |
| Flechas (hit) | 44×44px |

## Procedimiento de QA Visual

Para asegurar la fidelidad con Figma:
1. Iniciar servidor: `npm run dev`
2. Ir a `/`
3. Click en pausa (verificar atributo `data-carousel-state="paused"`)
4. Confirmar `data-active-index`
5. Capturar pantalla en 375×812 (móvil), 768×1024 (tablet), 1440×900 (desktop)
6. Guardar evidencia en `.omo/evidence/mult-221-hero-carousel/revised/`

### Deterministic Browser QA Mechanism

The hero exposes two test-only attributes for deterministic screenshot capture:

- `data-carousel-state` on the `<section>` — `"playing"` while autoplay runs, `"paused"` after the pause button is clicked. Playwright waits for `[data-carousel-state="paused"]` before capturing so the slide cannot change mid-shot.
- `data-active-index` on the `#hero-carousel` viewport — the zero-based index of the active slide. Tests select a known slide via this attribute and wait for its transition to finish before capture.

Executed QA (recorded evidence):
1. `npm run dev`
2. Navigate to `/`
3. Wait for `[role="region"][aria-roledescription="carrusel"]`
4. Click `[aria-label="Siguiente"]`; assert `data-active-index` changes 0 -> 1
5. Click pause; assert `data-carousel-state="paused"`
6. Set viewport 1440×900 → screenshot `.omo/evidence/mult-221-hero-carousel/revised/desktop-1440x900.png`
7. Set viewport 768×1024 → screenshot `.omo/evidence/mult-221-hero-carousel/revised/tablet-768x1024.png`
8. Set viewport 375×812 → screenshot `.omo/evidence/mult-221-hero-carousel/revised/mobile-375x812.png`
9. Assert `document.documentElement.scrollWidth === document.documentElement.clientWidth` at every viewport
10. Navigate to `/auth/login`; assert main content remains `max-w-6xl` constrained

## Gestión de fallos

- **Sin arte**: Fallback visual estético, no dejar espacio vacío.
- **Overflow**: Gestión via `overflow-hidden`.
- **Preferencia movimiento**: `motion-reduce:transition-none` respetado.

## Consumo de API

Esta feature implementa el [patrón de servicios con fallback](../../docs/frontend-architecture/patterns/api-fallback.md) para garantizar la disponibilidad de datos en desarrollo:

- **Servicios**: Los endpoints `getMovies`, `getMovieFunctions(movieId, cityId?)` y `getMovieRecommendations(movieId)` consumen el contrato de API, desempaquetan el envelope `{ success, data }` y, ante fallo de red/5xx o si `VITE_ENABLE_MOCKS=true`, recurren a los mocks `getMockMovies`, `getMockMovieFunctions` y `getMockMovieRecommendations` (con ~400ms de retardo).
- **Notificaciones**: Se emite una única alerta vía `notifyWarning` al activar el fallback.
- **Estado**: Se registra el origen de los datos en `useMoviesSourceStore`.
- **Hooks**: Los hooks `useMovieFunctions` (queryKey `["movieFunctions", movieId, cityId]`) y `useMovieRecommendations` (queryKey `["movieRecommendations", movieId]`) gestionan la caché (`staleTime` 60s y 10min respectivamente).

Para detalles de los payloads, ver:
- [GET /movies/{movieId}/functions](../../docs/api/endpoints/02-movies/10-GET-movies-movieId-functions.md)
- [GET /movies/{movieId}/recommendations](../../docs/api/endpoints/02-movies/11-GET-movies-movieId-recommendations.md)

## Módulos

| Módulo | Ruta | Descripción |
| :--- | :--- | :--- |
| [Interfaces](./interfaces/movie.ts) | `interfaces/movie.ts` | Contrato de datos `Movie`. |
| [Interfaces](./interfaces/movieFunction.ts) | `interfaces/movieFunction.ts` | Contrato de datos `MovieFunction`. |
| [Interfaces](./interfaces/movieRecommendation.ts) | `interfaces/movieRecommendation.ts` | Contrato de datos `MovieRecommendation`. |
| [Servicio](./services/movies.service.ts) | `services/movies.service.ts` | Consumo de datos de películas. |
| [Servicio](./services/movies.mock.ts) | `services/movies.mock.ts` | Mock de datos para desarrollo. |
| [Store](./store/moviesSourceStore.ts) | `store/moviesSourceStore.ts` | Store de estado de origen. |
| [Hook `useMovies`](./hooks/useMovies.ts) | `hooks/useMovies.ts` | Hook de acceso a los datos de películas (TanStack Query). |
| [Hook `useMovieFunctions`](./hooks/useMovieFunctions.ts) | `hooks/useMovieFunctions.ts` | Hook de acceso a funciones. |
| [Hook `useMovieRecommendations`](./hooks/useMovieRecommendations.ts) | `hooks/useMovieRecommendations.ts` | Hook de acceso a recomendaciones. |
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
| Hero outer radius | NONE (no outer 20px card border radius) | `docs/design/08-bordes.md` |
| Slide transition | `transition-transform duration-500 ease-in-out` | `docs/design/14-animaciones.md` |
| Reduced motion | `motion-reduce:transition-none` | `docs/design/14-animaciones.md` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` | `docs/design/15-accesibilidad.md` |
| Autoplay interval | 5000ms | `docs/design/14-animaciones.md` |
