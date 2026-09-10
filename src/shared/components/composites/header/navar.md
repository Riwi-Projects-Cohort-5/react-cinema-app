# CentralNav

## Descripción

Barra de navegación central (`Navar.tsx`) del sistema de diseño de **React Cinema App**, renderizada por el `MainLayout` entre el `Header` y el `Outlet`. Vive en `src/shared/components/composites/header/Navar.tsx` y exporta la función `CentralNav`.

Se re-exporta desde el barrel de composites: `@shared/components/composites` (ver [README de composites](../../README.md)).

## Estructura

Barra `bg-divider` con borde redondeado (`rounded-2xl`):

- **Center:** los `NavLink` (`Cartelera`, `Próximos estrenos`, `Promociones`, `Salas y Cines`) se centran con posicionamiento absoluto (`left-1/2 -translate-x-1/2`), independiente del ancho de los controles del lado derecho.
- **Right:** pill de **ubicación** (primitiva `Dropdown` con `defaultValue="Barranquilla"`) y botón de **búsqueda** (primitiva `Button` con `MagnifyingGlassIcon`), sin comportamiento asignado aún.

## Composición

| Elemento       | Detalle                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Contenedor     | `bg-divider`, `rounded-2xl`, `p-1.5`, borde `border-gray-800/80`, márgenes laterales `mx-4`                    |
| NavLinks       | `NavLink` de React Router, `text-sm`, hover `text-white`                                                       |
| Ubicación      | `Dropdown` con `triggerIcon={<MapPinIcon ... class="text-primary">}` y `triggerClassName` pill (`bg-surface-variant`, `rounded-full`, `outline-border`) |
| Búsqueda       | `Button` `variant="secondary"` `radius="full"` con `MagnifyingGlassIcon`; sin `onClick` (placeholder)          |

> `triggerIcon` y `triggerClassName` son props de la primitiva `Dropdown` (ver [dropdown.md](../../primitives/dropdown/dropdown.md)): el pill de la ubicación es **relativo al contexto de uso**, configurado con `cn` + `tailwind-merge`, no hardcodeado en la primitiva base.

## Props

Sin props. Las opciones de ubicación (`Barranquilla`, `Bogotá`, `Medellín`, `Cali`) viven como constante local `locationOptions`; cuando exista el catálogo real de ciudades se moverá al dataset de la feature.

## Documentos relacionados

- [Header](./header.md) — barra superior.
- [Footer](../footer/footer.md) — cierre de página.
- [Dropdown](../../primitives/dropdown/dropdown.md) — primitiva de selección reutilizada.
- [README de composites](../../README.md)
- [Routing](../../../../../docs/frontend-architecture/navigation/routing.md) — destinos de los `NavLink`.