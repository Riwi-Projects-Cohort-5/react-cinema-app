# Patrón de servicios con fallback

## Descripción

El backend envuelve todas las respuestas en una estructura tipo envelope `{ success, data }` (ver [convenciones de API](../../api/00-conventions.md#5-paginación)). Debido a que el mock server de Postman no siempre cubre todos los estados de respuesta y el frontend requiere datos de respaldo confiables durante el desarrollo, implementamos un patrón de servicios con respaldo (fallback) y desempaquetado de envelope.

## Componentes del patrón

1. **`ApiEnvelope<T>` y `unwrapList`**: Los servicios procesan la respuesta del servidor, extraen `data` del envelope y validan que el contenido sea un arreglo. Una respuesta malformada se trata como un fallo.
2. **`isApiUnavailable(error)`**: Detecta cuándo la API no está disponible (errores de red, status HTTP >= 500, o respuesta malformada).
3. **`withFallback(fn, fallback, message)`**: Ejecuta la petición real. Si `env.enableMocks` es `true`, devuelve el valor de `fallback` sin llamar a la API. Si la API falla según `isApiUnavailable`, devuelve `fallback` y notifica una sola vez con `notifyWarning(message, ...)`. Las peticiones que resulten en errores 4xx o sean canceladas (vía `AbortSignal`) siempre se re-lanzan.
4. **Store de origen (`useLocationSourceStore` / `useMoviesSourceStore`)**: Registra en un store Zustand si los datos mostrados provienen del fallback, permitiendo que la interfaz notifique al usuario que está visualizando datos de ejemplo.
5. **Mocks con `withDelay(ms)`**: Los fixtures de respaldo integran un retardo simulado (aprox. 400ms) para ejercitar los estados de carga en la aplicación.

## Cuándo usar el patrón

Utiliza este patrón al desarrollar cualquier funcionalidad que consuma endpoints de listado del contrato de API. Para integrarlo, copia la estructura implementada en `features/location` o `features/movies`.

## Deuda técnica

El proceso de desempaquetado del envelope se encuentra actualmente duplicado en cada feature. El documento [convenciones de API](../../api/00-conventions.md#5-paginación) registra la necesidad de decidir si esta lógica debe trasladarse a un interceptor compartido de `httpClient`.

## Documentos relacionados

- [Cliente HTTP](../data-layer/http-client.md)
- [Lógica de negocio](./business-logic.md)
- [Convenciones de API](../../api/00-conventions.md#5-paginación)
- [Variables de entorno](../tooling/environment.md)
