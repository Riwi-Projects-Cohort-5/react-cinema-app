# HeroSlideContent

Componente que renderiza el contenido de una diapositiva activa, incluyendo título, sinopsis, metadatos y botones de acción.

## Layout

Contenido posicionado absolutamente en la parte inferior izquierda dentro del slide.

## Props

| Prop | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `movie` | `Movie` | Sí | Objeto de la película a mostrar. |
| `onPlayTrailer` | `() => void` | Sí | Callback para abrir el modal del tráiler. |
| `onShowtimes` | `() => void` | Sí | Callback para ver horarios. |

## Responsivo

Las llamadas a la acción (CTAs) se apilan verticalmente en móviles. Usa `font-primary` para títulos y `font-secondary` para el cuerpo.

## Referencias de diseño
- Implementación RON-06 basada en `MULT-158.xml`.
- Tipografía y espaciado según `docs/design/04-tipografia.md`.
