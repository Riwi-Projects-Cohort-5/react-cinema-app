# HeroProgress

Indicadores de progreso y controles para pausar/reanudar el autoprogramado del carrusel.

## Props

| Prop | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `movies` | `Movie[]` | Sí | Lista de películas. |
| `activeIndex` | `number` | Sí | Índice de la película activa. |
| `progress` | `number` | Sí | Progreso del slider actual (0-1). |
| `isPaused` | `boolean` | Sí | Estado del autoplay (pausado/reproduciendo). |
| `onGoTo` | `(index: number) => void` | Sí | Callback para navegar a una diapositiva. |
| `onTogglePause` | `() => void` | Sí | Callback para alternar estado de reproducción. |

## Referencias de diseño
- Implementación RON-08 basada en `MULT-160.xml`.
