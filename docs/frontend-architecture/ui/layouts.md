# Layouts (app-shells)

## Descripción

Los app-shells globales envuelven los grupos de rutas de la aplicación. Viven en `src/layouts/` (y el app-shell público en `src/shared/layouts/`), se re-exportan desde `src/layouts/index.ts` y son rutas layout sin path que renderizan sus hijos con `<Outlet />`.

## Layouts disponibles

| Layout               | Archivo                                    | Nav / estructura                                              |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| **Main (público)**   | `src/shared/layouts/MainLayout.tsx`        | Header + CentralNav + `<Outlet />` + Footer; envuelve casa y auth |
| **Autenticado**      | `src/layouts/AuthenticatedLayout.tsx`      | Perfil, Historial de compras, Checkout                         |
| **Admin**            | `src/layouts/AdminLayout.tsx`              | Sidebar: Dashboard                                             |

> **MainLayout** es el app-shell raíz del proyecto: monta composite `Header`, `CentralNav` y `Footer` de `@shared/components/composites`, y renderiza las sub-rutas con `<Outlet />`. Las rutas bajo él se asignan en [Routing](../navigation/routing.md).

> Las rutas que envuelve cada layout se asignan en [Routing](../navigation/routing.md).

> Las entradas de navegación apuntan a las features del contrato de API: el nav autenticado cubre perfil (`06-profile/`), órdenes/historial (`11-orders/`) y checkout/carrito (`08-cart/`, `10-payments/`); el sidebar admin apunta al [dashboard](../../api/endpoints/86-GET-dashboard.md). Ver [catálogo de endpoints](../../api/README.md).

## Asignación

Los layouts se asignan en `src/routes/appRouter.tsx`:

```tsx
{
  element: <MainLayout />,
  children: [
    { path: PATHS.home, element: <PlaceholderPage title="Home" /> },
    // auth, rutas protegidas y admin anidadas bajo MainLayout
  ],
},
```

## Navegación

La navegación usa `<Link>` de React Router con `PATHS`; las rutas privadas se protegen con `ProtectedRoute` (ver [Guardas](../navigation/guards.md)). El acceso admin usa `ProtectedRoute` por ahora; la guarda por rol (Administrator/Employee/Customer) llegará con la feature de autorización.

Las pruebas de los layouts (`src/layouts/layouts.test.tsx`) se documentan en [Testing](../tooling/testing.md).

## Documentos relacionados

- [Routing](../navigation/routing.md)
- [Guardas](../navigation/guards.md)
- [Páginas de aplicación](./app-pages.md)
- [Estructura del proyecto](../architecture/project-structure.md)
- [Contrato de API](../../api/README.md) — módulos a los que navega cada layout.
