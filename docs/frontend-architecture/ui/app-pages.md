# Páginas de aplicación

## Descripción

Las páginas de nivel de aplicación son recursos compartidos que no pertenecen a una feature específica. Viven en `src/pages/` y se re-exportan desde `src/pages/index.ts`.

## Página 404

`src/pages/NotFoundPage.tsx` — renderiza un encabezado `404`, un mensaje descriptivo y un enlace "Volver al inicio". Se registra en la ruta catch-all del router:

```tsx
{
  path: "*",
  element: <NotFoundPage />,
},
```

## Página de error general

`src/pages/GeneralErrorPage.tsx` — renderiza el mensaje de error (opcional), un botón "Recargar" y un enlace "Volver al inicio". Acepta `message` vía props.

Se usa en dos lugares:

1. **Ruta `/error`** en `src/routes/appRouter.tsx` (`PATHS.error`).
2. **Fallback por defecto de `ErrorBoundary`** (`src/shared/components/ErrorBoundary.tsx`) — cuando un error es capturado, renderiza `<GeneralErrorPage message={...} />`. Permite override con la prop `fallback` si un punto específico necesita un comportamiento distinto (ver [Manejo global de errores](../tooling/error-handling.md)).

La página de error general cubre los **estados de pantalla obligatorios** de error que define el contrato de API ([convenciones §13](../../api/00-conventions.md#13-estados-de-pantalla-obligatorios-hu-fe-transversal)): error recuperable, error no recuperable y sesión expirada, reutilizando el mismo patrón de fallback.

## Documentos relacionados

- [Routing](../navigation/routing.md)
- [Manejo global de errores](../tooling/error-handling.md)
- [Layouts](./layouts.md)
- [Convenciones de API](../../api/00-conventions.md) — §4 (envelope de error) y §13 (estados de pantalla obligatorios).
