# Footer

## Descripción

Cierre de página del sistema de diseño de **React Cinema App**. Vive en `src/shared/components/composites/footer/Footer.tsx` y se renderiza al final del `MainLayout`. Se compone de primitivas (`Button`) y `NavLink` de React Router, con tokens del tema definidos en [Design tokens](../../../../../docs/design/11-design-tokens.md).

Se re-exporta desde el barrel de composites: `@shared/components/composites` (ver [README de composites](../../README.md)).

## Estructura

`<footer>` con `bg-divider` y grilla responsiva `md:grid-cols-4`:

1. **Logo + descripción**: imagen `src/assets/logo.svg`, tagline y redes sociales (`InstagramLogoIcon`, `FacebookLogoIcon`, `XLogoIcon`, `YoutubeLogoIcon`) como `a` con fondo `white/5` y hover `white/10`.
2. **Navegación**: links `Cartelera`, `Próximos estrenos`, `Cine Flash`, `Confitería`, `Promociones`, `Complejos`.
3. **Mi cuenta**: `Iniciar sesión`, `Registrarse`, `Mis entradas`, `Mis puntos`, `Perfil`, `Favoritos`.
4. **Cines destacados + Newsletter**: complejos RC (`/cinemas/*`) y formulario de suscripción con `input type="email"` y botón `Button` secondary.
5. **Barra inferior**: copyright, `Términos de uso`, `Privacidad`, `Cookies`.

## Composición

| Elemento     | Detalle                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| Contenedor   | `<footer>` `bg-divider`, `text-text-custom`, grilla `gap-10` `md:grid-cols-4`     |
| Títulos      | `text-sm`, `uppercase`, `tracking-widest`, `text-white/40`                       |
| Links        | `NavLink` `text-sm`, hover `text-white`                                           |
| Newsletter   | `input` con borde/fondo `white/5` + `Button` secondary (fondo anulado con `cn`)   |
| Redes        | `a` `h-7 w-7` `rounded-md` `bg-white/5` con íconos Phosphor `size-20`             |

## Documentos relacionados

- [Header](../header/header.md) — barra superior.
- [CentralNav](../header/navar.md) — barra de navegación central.
- [README de composites](../../README.md)
- [Design tokens](../../../../../docs/design/11-design-tokens.md)
- [Path aliases](../../../../../docs/frontend-architecture/development/path-aliases.md)