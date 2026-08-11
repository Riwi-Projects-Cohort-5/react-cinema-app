# Manejo global de errores

## Descripción

El proyecto maneja errores en tres capas complementarias:

1. **`ApiError`** (`src/services/api-error.ts`) — error normalizado que devuelven los interceptores del cliente HTTP (ver [data-layer/api-error.md](../data-layer/api-error.md)).
2. **`registerGlobalErrorHandlers()`** (`src/services/globalErrorHandlers.ts`) — captura excepciones y promesas rechazadas no manejadas.
3. **`ErrorBoundary`** (`src/shared/components/ErrorBoundary.tsx`) — captura errores de render del árbol de componentes.

## Listeners globales

`registerGlobalErrorHandlers()` registra listeners de `window` para:

- `error` — excepciones no capturadas.
- `unhandledrejection` — promesas rechazadas sin manejar.

Ambos registran en consola y muestran un toast (ver [Notificaciones](./notifications.md)). Se llama una vez en `src/main.tsx`.

## ErrorBoundary

Boundary de clase que captura errores de **render** de todo el árbol debajo de él. Muestra una UI de fallback con el mensaje y un botón **Recargar**, o un `fallback` personalizado vía prop. Envuelve `<App/>` en `src/main.tsx`.

El fallback por defecto es `GeneralErrorPage` (ver [Páginas de aplicación](../ui/app-pages.md)).

```tsx
// src/main.tsx
registerGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
```

> El manejo global de errores complementa al modelo `ApiError` del contrato de API: los errores de red/HTTP normalizados (envelope de [§4](../../api/00-conventions.md#4-envelope-de-error-estándar)) se muestran vía toasts, mientras los errores de render del árbol quedan cubiertos por el `ErrorBoundary`. Ambas capas sirven los [estados de pantalla obligatorios §13](../../api/00-conventions.md#13-estados-de-pantalla-obligatorios-hu-fe-transversal).

## Documentos relacionados

- [Modelo de error `ApiError`](../data-layer/api-error.md)
- [Notificaciones visuales](./notifications.md)
- [Páginas de aplicación](../ui/app-pages.md)
- [Convenciones de API](../../api/00-conventions.md) — §4 (envelope de error) y §13 (estados de pantalla).
