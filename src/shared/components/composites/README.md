# Composites

## Descripción

Componentes compuestos del sistema de diseño de **React Cinema App**, construidos a partir de primitivas y/o librerías de base. Cada composite vive en su propia carpeta (`kebab-case/`) con su componente y su documentación colocated, y se re-exporta desde el barrel `index.ts` de esta carpeta.

Importación recomendada (desde el barrel):

```tsx
import { AppToaster } from "@shared/components/composites";
```

## Catálogo

| Composite                                  | Descripción                                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| [AppToaster](./app-toaster/app-toaster.md) | Contenedor de toasts (wrapper de `sonner`) con el theme del design system; lo consumen todas las features vía `@services/notify`. |
| [Header](./header/header.md)               | Barra superior con botones Register/Login, redes sociales y logo.                                                                 |
| [CentralNav](./header/navar.md)            | Barra de navegación central con links, pill de ubicación (`Dropdown`) y botón de búsqueda.                                        |
| [Footer](./footer/footer.md)               | Pie de página: logo, navegación, cuenta, cines, newsletter y barra legal.                                                         |

## Cómo agregar un composite

1. Crear la carpeta `composites/<nombre>/` (kebab-case).
2. Agregar el componente `<Nombre>.tsx` (PascalCase).
3. Agregar el doc colocated `<nombre>.md`.
4. Re-exportar el componente en `composites/index.ts` (barrel).
5. Agregar una fila a la tabla del catálogo.
