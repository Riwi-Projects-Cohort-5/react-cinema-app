# POST /api/v1/users/location

## Historia de usuario relacionada
- **HU-FE-002** — Selección de país, departamento y ciudad. Persiste la ciudad elegida en el servidor para que la ubicación del usuario sobreviva entre dispositivos y sesiones.

## Propósito
Almacena la ciudad preferida del usuario autenticado en el servidor. Los usuarios anónimos **no** llaman a este endpoint — conservan la ciudad solo en `localStorage` (`multicine_city`). La llamada es deliberadamente no crítica: las fallas nunca deben bloquear al usuario para continuar en la plataforma.

## Método HTTP
POST

## URL
`/api/v1/users/location` (URL completa: `https://api.multicine.com/api/v1/users/location`)

## Autenticación
Autenticado (Bearer JWT). Un `401` aquí solo se espera si la sesión expiró; trátalo según convenciones §3 (refresco silencioso + reintento).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2, §3) |
| `Content-Type` | Sí | `application/json` |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "cityId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cityId` | string (UUID v4) | Sí | Id de la ciudad seleccionada en el asistente de ubicación (convenciones §8) |

## Respuestas de éxito

### 200 OK
La ciudad se persiste y se devuelve como confirmación.

```json
{
  "city": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Medellín",
    "departmentId": "0f8fad5b-d9cb-469f-a165-70867728950e"
  },
  "message": "Ubicación actualizada"
}
```

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `401`, `404`, `422`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Cuerpo malformado / falta `cityId` | Ignorar en silencio; conservar el valor de `localStorage` |
| 401 | `ACCESS_TOKEN_EXPIRED` | Token expirado | El interceptor refresca y repite una vez (§3); si el refresco falla → redirigir al login |
| 404 | `NOT_FOUND` | La ciudad no existe | Ignorar; la selección local puede estar desactualizada — sugerir volver a ejecutar el asistente |
| 422 | `CITY_INACTIVE` | La ciudad no tiene cines activos | Mostrar "La ciudad no está disponible" y recargar la lista de ciudades |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Ignorar (no bloqueante); reintentar en la próxima confirmación del asistente |

```json
{
  "error": {
    "code": "CITY_INACTIVE",
    "message": "La ciudad no está disponible actualmente",
    "details": [
      { "field": "cityId", "message": "No hay cines activos en esta ciudad" }
    ],
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- Se llama **solo si está autenticado** y **solo después de que el usuario confirme** el asistente de ubicación. Los invitados lo omiten por completo (solo `localStorage`).
- **No bloqueante / disparar y olvidar**: usa `.catch(() => {})` o una Promise que la navegación nunca espere. El valor de `localStorage.multicine_city` sigue siendo la fuente de verdad para la sesión actual.
- TanStack Query: no se necesita clave de caché (disparar y olvidar); si decides rastrearlo, basta una mutation simple sin `invalidateQueries`. Las invalidaciones provocadas por el cambio de ciudad (`["movies"]`, `["cineflash"]`) pertenecen al flujo del select de ciudad, no a esta mutation.
- Ante `422 CITY_INACTIVE`: mostrar "La ciudad no está disponible", eliminarla de la lista local de ciudades y recargar las opciones de ciudad para que el usuario elija otra.
- Ante `401`: el interceptor maneja el refresco; si el refresco falla, mostrar el modal de sesión expirada (§3, §13).

## Reglas de validación
- Solo enviar si realmente hay una ciudad seleccionada.
- `cityId` debe ser un UUID v4 válido.
- Nunca bloquear las transiciones de la UI mientras esta petición esté en vuelo.

## Reglas de negocio
- Una ciudad solo se puede persistir si tiene al menos un cine activo (espejo de `GET /departments/{departmentId}/cities`).
- Invitado → el servidor nunca almacena nada; la ubicación es anónima por diseño.

## Notas de seguridad
- Endpoint autenticado; el servidor vincula la ciudad al usuario actual (`sub` del JWT) — nunca confíes en un `userId` enviado por el cliente.
- Los datos de la ciudad no son sensibles; aun así mantén una validación estricta de `cityId` para evitar registros basura.

## Flujo de ejemplo
1. El usuario confirma "Medellín" en el asistente de ubicación.
2. El frontend escribe `localStorage.multicine_city = { id, name }`.
3. Si existe un access token válido → `POST /api/v1/users/location` con `{ cityId }` (no esperado).
4. Ante `422` → toast "La ciudad no está disponible" + recargar la lista de ciudades.
5. Ante éxito → toast "Ubicación actualizada"; las consultas de la cartelera ya fueron invalidadas por el paso del select.
