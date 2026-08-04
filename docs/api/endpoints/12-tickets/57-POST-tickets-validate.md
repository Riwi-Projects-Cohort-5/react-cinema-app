# POST /api/v1/tickets/validate

## Historia de usuario relacionada
- **HU-FE-024** — Escaneo y validación de QR. Validación en puerta del lado del staff en la entrada del cine.

## Propósito
Valida el código QR de una entrada en la entrada del cine. El endpoint siempre responde `200` con una bandera `valid` y un `reason` — una entrada mala es un *resultado*, nunca un error HTTP — para que la interfaz del escáner pueda renderizar una pantalla de veredicto de alto contraste (verde válida / rojo inválida) por cada escaneo sin mapear códigos HTTP a resultados.

## Método HTTP
POST

## URL
`/api/v1/tickets/validate` (URL completa: `https://api.multicine.com/api/v1/tickets/validate`)

## Autenticación
- Rol requerido: **COLLABORATOR** (staff) — Bearer JWT con el rol de colaborador (convenciones §3).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Authorization` | Sí | `Bearer <accessToken>` con rol `COLLABORATOR` (convenciones §2) |
| `Content-Type` | Sí | `application/json` (convenciones §2) |
| `Accept` | Recomendada | `application/json` |

## Parámetros de ruta
Ninguno.

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
```json
{
  "qrCode": "MC-8D4FA2B1"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `qrCode` | string | Sí | El código QR legible/alnumérico de la entrada, leído por el escáner de cámara o escrito manualmente (convenciones §8; no es un UUID) |

## Respuestas de éxito
Todos los resultados son `200 OK`; la bandera `valid` + `reason` los distinguen.

**Entrada válida — admitir ingreso:**

```json
{
  "valid": true,
  "ticket": {
    "code": "MC-8D4FA2B1",
    "movieTitle": "El Último Horizonte",
    "functionAt": "2026-08-14T21:10:00Z",
    "cinema": { "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", "name": "Multicine El Tesoro" },
    "room": { "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Sala 3" },
    "seatLabel": "F-7",
    "holderName": "Valentina Rojas"
  }
}
```

**Ya utilizada:**

```json
{
  "valid": false,
  "reason": "USED",
  "message": "Esta entrada ya fue utilizada"
}
```

**Inválida:**

```json
{
  "valid": false,
  "reason": "INVALID",
  "message": "Esta entrada no es válida"
}
```

| `reason` | Significado |
|---|---|
| `INVALID` | Código malformado o que no es una entrada real |
| `EXPIRED` | Función ya finalizada / entrada fuera de su ventana |
| `WRONG_CINEMA` | La entrada es para otro cine (el escáner está ligado a su sede) |
| `NOT_FOUND` | El código no coincide con ninguna entrada emitida |

## Respuestas de error
Todos los errores usan el envoltorio de convenciones §4. Códigos relevantes (nota: una entrada mala **no** es un error — es un `200` con `valid: false`):

| HTTP | Código | Significado / comportamiento de frontend |
|---|---|---|
| 401 | `ACCESS_TOKEN_EXPIRED` / `INVALID_TOKEN` | Flujo del interceptor (§3) |
| 403 | `FORBIDDEN` | No es `COLLABORATOR` → estado de bloqueo del escáner "Sin permisos" |
| 422 | `VALIDATION_ERROR` | `qrCode` vacío → mantener el escáner enfocado, mostrar pista en línea |
| 429 | `RATE_LIMITED` | Demasiados escaneos (protección contra ráfagas) → respetar `retryAfterSeconds` (§10) |
| 500 | `SERVER_ERROR` | Error con reintento (§13) |

Ejemplo completo — no es colaborador (`403`):

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para validar entradas",
    "requestId": "req_01HZH..."
  }
}
```

## Consideraciones de frontend
- **Escáner QR de cámara** con un **respaldo de ingreso manual del código** (escribir el código) para casos de QR con poca luz/ilegibles.
- Después de cada escaneo, mostrar una **pantalla de resultado de alto contraste**: verde a pantalla completa ("Entrada válida") o roja ("Entrada no válida") con la razón, más **sonido/vibración** según el resultado.
- **Evitar revalidar el mismo código escaneado**: una vez manejado un escaneo, bloquear el escáner; un **botón de reinicio** habilita el siguiente escaneo. Eliminar lecturas repetidas del mismo valor.
- `valid: true` → mostrar el resumen de la entrada + la etiqueta del asiento de forma prominente para la admisión. `valid: false` → mostrar el mensaje de razón desde `reason`/`message` (USED, EXPIRED, WRONG_CINEMA, etc.).
- En `403` → estado de bloqueo "Sin permisos" (app de staff), sin escáner.
- Mantener un registro de escaneos local (no bloqueante) para la vista operativa del turno; `X-Request-Id` por escaneo ayuda a la trazabilidad.
- TanStack Query: esto es una mutación por escaneo (`useMutation`); no hay caché compartida que invalidar.

## Reglas de validación
- `qrCode` no vacío (quitar espacios); limitar la longitud al formato de código documentado.
- Proteger contra escaneos duplicados del mismo código antes de enviar (deduplicación en el cliente por sesión de escaneo).

## Reglas de negocio
- Una entrada es válida exactamente una vez: la primera validación exitosa la transiciona `ACTIVE` → `USED` (en el servidor).
- `WRONG_CINEMA` protege contra la validación entre sedes — la sede del escáner se deriva del cine asignado al colaborador, no del cliente.
- Códigos regenerados/transferidos: solo el **último** código es válido; los códigos más antiguos devuelven `INVALID`/`NOT_FOUND`.

## Notas de seguridad
- **Restringido por rol** (COLLABORATOR) — nunca exponer la validación a clientes o llamadores anónimos.
- Los códigos QR son credenciales de ingreso; las respuestas de validación no deben filtrar datos de otros usuarios más allá de la entrada admitida.
- Registrar los resultados de escaneo en el servidor (traza de auditoría); no registrar el código completo en la analítica del cliente.

## Flujo de ejemplo
```
El staff inicia sesión con rol COLLABORATOR → se abre el escáner
↓
Escanea el QR (o escribe el código) → POST /tickets/validate { qrCode }
↓
valid: true → pantalla verde + sonido, admitir en la puerta
(o)
valid: false → pantalla roja + razón (USED / EXPIRED / WRONG_CINEMA / ...)
↓
Botón de reinicio → siguiente escaneo (el mismo código no se puede revalidar en la misma sesión)
```
