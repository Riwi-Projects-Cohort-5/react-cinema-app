# PUT /api/v1/promotions/{promotionId}

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-026** — Administración de promociones y cupones. Edita los campos de una promoción y la alterna activa/inactiva desde el panel de administración. Alias en backlog: `PUT /promotions` (acotado por ítem para consistencia REST).

## Propósito
Actualiza una promoción existente — su descripción, alcance, validez, descuento y condiciones — y alterna la bandera activa/inactiva que decide si llega a los clientes. La pantalla de edición se precarga con el estado actual de la promoción y visualiza su ciclo de vida (activa / próxima / vencida).

## Método HTTP
PUT

## URL
`/api/v1/promotions/{promotionId}` (URL completa: `https://api.multicine.com/api/v1/promotions/{promotionId}`)

## Autenticación
- Rol requerido: **ADMIN** (Bearer JWT, convenciones §3).

## Cabeceras
| Cabecera | Requerida | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` (convenciones §2) |
| `Content-Type` | Sí | `application/json` |
| `Accept` | Recomendada | `application/json` |
| `X-Request-Id` | Opcional | UUID generado por el cliente, devuelto por el servidor para trazabilidad |

## Parámetros de ruta
| Nombre | Tipo | Requerido | Descripción |
|---|---|---|---|
| `promotionId` | string (UUID v4) | Sí | Id de la promoción (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Misma forma que `POST /promotions` **más** `isActive`. Los campos opcionales omitidos conservan su valor actual (semántica de merge).

```json
{
  "name": "Dos por uno martes",
  "description": "Compra dos boletas y paga una en todas las funciones 2D y 3D de los martes.",
  "type": "TWO_FOR_ONE",
  "discountValue": 100,
  "scope": {
    "all": false,
    "movies": [],
    "cinemas": ["1c2b3a4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d"],
    "cities": []
  },
  "validity": {
    "startAt": "2026-08-01T00:00:00Z",
    "endAt": "2026-09-30T23:59:59Z"
  },
  "accumulable": false,
  "quantityLimit": 4,
  "maxRedemptions": 1500,
  "isActive": true
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| *todos los campos de `POST`* | — | No | Cualquier subconjunto; los campos opcionales omitidos se conservan (merge) |
| `isActive` | boolean | Sí | `true` → visible para los clientes (si está dentro de la validez); `false` → oculta. Este es el interruptor de activación. |

## Respuestas de éxito

**200 OK** — promoción actualizada.

```json
{
  "promotionId": "6e5f4a3b-2c1d-4e5f-8a9b-0c1d2e3f4a5b",
  "isActive": true
}
```

## Respuestas de error
Todos los errores usan el envelope compartido (convenciones §4). Códigos relevantes:

| HTTP | Código | Significado / comportamiento del frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es ADMIN → estado "No tienes permiso" (§13) |
| 404 | `NOT_FOUND` | La promoción no existe → redirige a la lista |
| 422 | `VALIDATION_ERROR` | Las mismas reglas que POST (`endAt` posterior a `startAt`, rango de descuento, alcance) → mapea `details` a los campos |
| 500 | `SERVER_ERROR` | Fallo inesperado → error reintentable (§13) |

Ejemplo completo — no encontrado (`404`):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La promoción no existe",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Formulario de edición precargado** con el estado actual de la promoción (la lista/tabla de administración provee la fila; opcionalmente re-haz fetch del detalle de `GET /promotions` cuando el módulo lo exponga).
- **Visualización del estado de validez**: una insignia que deriva de `isActive` + `validity` vs. `Date.now()` (convenciones §7): **Activa** (activa + dentro de la ventana), **Próxima** (activa + inicio en el futuro), **Expirada** (fin pasado), **Inactiva** (deshabilitada). Calcúlalo localmente a partir de los datos cargados.
- El **interruptor de activación** se mapea a `isActive`; advierte en la UI al activar una promoción cuya ventana ya terminó (no se mostrará hasta que se establezca una nueva ventana).
- Al guardar: `queryClient.invalidateQueries({ queryKey: ["promotions"] })` para que la lista y el feed público de `GET /promotions` se refresquen.
- Cargando → skeleton del formulario; estado de guardado en el botón de envío; 404 → redirige; 403 → estado de permisos (§13).
- No se necesita clave de idempotencia aquí: PUT es naturalmente idempotente (§9 aplica a las creaciones).

## Reglas de validación
Valida ANTES de enviar:
- Las mismas reglas de cliente que POST (`endAt > startAt`, rango de descuento por tipo, validez del alcance).
- Envía solo los campos modificados (merge) para no sobrescribir valores que no tocaste.

## Reglas de negocio
- `isActive: false` oculta de inmediato la promoción a los clientes sin importar la validez.
- `isActive: true` **no** sobreescribe la validez — una promoción solo se muestra mientras `now ∈ validity`.
- Editar el `type`/`discountValue` de una promoción ya referenciada por cupones está permitido, pero se señala al administrador (los cupones pueden tener prioridad).

## Notas de seguridad
- Solo ADMIN, aplicado por el backend (403 FORBIDDEN).
- Los cambios de activación afectan dinero y deben ser auditables (trail de auditoría — ver `GET-admin-conventions.md`).

## Flujo de ejemplo
1. El administrador abre la lista de promociones → toca editar en una promoción.
2. El formulario se precarga; la insignia dice "Próxima" (activa, empieza el próximo mes).
3. El administrador extiende `endAt`, activa `isActive: true`, guarda.
4. 200 → `{ promotionId, isActive: true }` → invalida `["promotions"]`.
5. El `GET /promotions` público ahora incluye la promoción cuando inicia la ventana.
