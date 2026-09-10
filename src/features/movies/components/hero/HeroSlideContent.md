# HeroSlideContent

Componente que renderiza el contenido de una diapositiva activa del carrusel, incluyendo título, sinopsis, metadatos y botones de acción.

## Props

| Prop | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `movie` | `Movie` | Sí | Objeto de la película a mostrar. |
| `onPlayTrailer` | `() => void` | Sí | Callback para abrir el modal del tráiler. |
| `onShowtimes` | `() => void` | Sí | Callback para ver horarios. |

## Referencias de diseño
- Implementación RON-06 basada en `MULT-158.xml`.
- Tipografía y espaciado según `docs/design/04-tipografia.md`.
