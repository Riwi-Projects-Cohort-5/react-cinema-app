# TrailerLightbox

Modal para la visualización del tráiler utilizando un iframe de YouTube.

## Comportamiento

- Renderiza null si está cerrado o falta URL.
- Fija el foco en el botón de cerrar al abrir.
- Cierra con la tecla `Escape` (listener `keydown`).
- URL de embebido mediante `getYouTubeEmbedUrl()` para modo nocookie.

## Props

| Prop         | Tipo         | Requerido | Descripción                      |
| :----------- | :----------- | :-------- | :------------------------------- |
| `isOpen`     | `boolean`    | Sí        | Estado de visibilidad del modal. |
| `trailerUrl` | `string      | null`     | Sí                               | URL del tráiler. |
| `onClose`    | `() => void` | Sí        | Callback para cerrar el modal.   |
| `movieTitle` | `string`     | Sí        | Título para el iframe y acceso.  |

## Referencias de diseño

- Implementación RON-06 basada en `MULT-158.xml`.
- Animaciones (fadeIn y slideUp) definidas en `docs/design/14-animaciones.md`.
