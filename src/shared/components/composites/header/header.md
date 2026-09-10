# Header

## Descripción

Barra superior (app-header) del sistema de diseño de **React Cinema App**. Vive en `src/shared/components/composites/header/Header.tsx` y se compone de primitivas (`Button`) con tokens del tema definidos en [Design tokens](../../../../../docs/design/11-design-tokens.md).

- **Izquierda:** acciones de acceso — botón **Register** (secondary, fondo transparente, hover sutil con `secondary/30`) y botón **Login** (primary).
- **Derecha:** redes sociales (íconos Phosphor en `text-secondary`), separador `|` y el **logo** (`src/assets/logo.svg`).

Se re-exporta desde el barrel de composites: `@shared/components/composites` (ver [README de composites](../../README.md)).

## Props

Sin props: componente stateless, puramente presentacional. No recibe handlers ni configuración; la navegación que disparen los botones se conectará en la feature auth.

## Uso

```tsx
import { Header } from "@shared/components/composites";

<Header />;
```

## Composición

| Elemento      | Detalle                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| Contenedor    | `header` con `bg-background`, `overflow-hidden`, alto `h-17`             |
| Register      | Primitiva `Button` `variant="secondary"`, fondo anulado con `cn` (`bg-transparent`), `text-text-custom`, hover `bg-secondary/30` |
| Login         | Primitiva `Button` `variant="primary"`, `text-white`, hover `bg-primary-hover` |
| Redes sociales | Phosphor `InstagramLogoIcon`, `FacebookLogoIcon`, `XLogoIcon`, `YoutubeLogoIcon` en `text-secondary` |
| Logo          | `src/assets/logo.svg` (`w-40`)                                            |

> El botón Register anula el fondo de la variante `secondary` con `cn` + `tailwind-merge` (patrón documentado en [README de primitivas](../../README.md)); el estilo del botón base es relativo y configurable desde el consumidor.

## Documentos relacionados

- [CentralNav](./navar.md) — barra de navegación central.
- [Footer](../footer/footer.md) — cierre de página.
- [README de composites](../../README.md)
- [Design tokens](../../../../../docs/design/11-design-tokens.md)
- [Iconografía](../../../../../docs/design/10-iconografia.md)
- [Path aliases](../../../../../docs/frontend-architecture/development/path-aliases.md)