# Layouts (app-shells)

## Descripción

Los app-shells globales envuelven los grupos de rutas de la aplicación. Viven en `src/layouts/`, se re-exportan desde `src/layouts/index.ts` y son rutas layout sin path que renderizan sus hijos con `<Outlet />`.

## Layouts disponibles

| Layout               | Archivo                          | Nav                                        |
| -------------------- | -------------------------------- | ------------------------------------------ |
| **Público**          | `src/layouts/PublicLayout.tsx`   | Inicio, Iniciar sesión, Registrarse        |
| **Autenticado**      | `src/layouts/AuthenticatedLayout.tsx` | Perfil, Historial de compras, Checkout |
| **Admin**            | `src/layouts/AdminLayout.tsx`    | Sidebar: Dashboard                         |

> Las rutas que envuelve cada layout se asignan en [Routing](../navigation/routing.md).

> Las entradas de navegación apuntan a las features del contrato de API: el nav autenticado cubre perfil (`06-profile/`), órdenes/historial (`11-orders/`) y checkout/carrito (`08-cart/`, `10-payments/`); el sidebar admin apunta al [dashboard](../../api/endpoints/86-GET-dashboard.md). Ver [catálogo de endpoints](../../api/README.md).

## Asignación

Los layouts se asignan en `src/routes/appRouter.tsx`:

```tsx
{
  element: <PublicLayout />,
  children: [{ path: PATHS.home, element: <PlaceholderPage title="Home" /> }],
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
