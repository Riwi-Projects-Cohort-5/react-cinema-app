# TrailerLightbox

Modal para la visualización del tráiler de una película utilizando un iframe de YouTube.

## Props

| Prop | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | Sí | Estado de visibilidad del modal. |
| `trailerUrl` | `string | null` | Sí | URL del tráiler. |
| `onClose` | `() => void` | Sí | Callback para cerrar el modal. |
| `movieTitle` | `string` | Sí | Título de la película para el iframe y acceso. |

## Referencias de diseño
- Implementación RON-06 basada en `MULT-158.xml`.
- Animaciones (fadeIn y slideUp) definidas en `docs/design/14-animaciones.md`.
