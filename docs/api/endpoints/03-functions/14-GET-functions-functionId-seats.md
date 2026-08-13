# GET /api/v1/functions/{functionId}/seats

> **Pendiente de confirmación con el backend.** Este endpoint **no** aparece en la colección Postman
> compartida. El contrato de abajo es la propuesta del frontend derivada del backlog; confirmar ruta,
> payload y códigos cuando el backend lo exponga.

## Historia de usuario relacionada
- **HU-FE-010** — Selección interactiva de sillas. Alimenta el mapa de sillas; los holds se gestionan con `POST /functions/{functionId}/seat-holds` y `DELETE /functions/{functionId}/seat-holds/{holdId}`.

## Propósito
Devuelve el **mapa de sillas en tiempo real** de una función: el layout de la sala (filas, tipos de silla, estados) y el precio por silla. El mapa se sondea durante la selección de sillas para detectar los cambios de reserva/venta a medida que ocurren.

## Método HTTP
GET

## URL
`/api/v1/functions/{functionId}/seats` (URL completa: `https://api.multicine.com/api/v1/functions/{functionId}/seats`)

## Autenticación
Pública. No se requiere token (solo lectura — crear/liberar holds requiere autenticación).

## Cabeceras
| Cabecera | Obligatoria | Descripción |
|---|---|---|
| `Accept` | Recomendada | `application/json` (ver convenciones §2) |

## Parámetros de ruta
| Nombre | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `functionId` | string (UUID v4) | Sí | Id de la función (convenciones §8) |

## Parámetros de consulta
Ninguno.

## Cuerpo de la petición
Ninguno. Petición GET.

## Respuestas de éxito

### 200 OK

```json
{
  "layout": {
    "roomName": "Sala 3",
    "screenPosition": "top",
    "rows": [
      {
        "letter": "A",
        "seats": [
          { "id": "5e7a4f1b-0001", "number": 1, "row": "A", "type": "GENERAL", "state": "AVAILABLE", "price": { "amount": 16500, "currency": "COP" } },
          { "id": "5e7a4f1b-0002", "number": 2, "row": "A", "type": "GENERAL", "state": "RESERVED", "price": { "amount": 16500, "currency": "COP" } },
          { "id": "5e7a4f1b-0003", "number": 3, "row": "A", "type": "DISABLED", "state": "DISABLED", "price": { "amount": 16500, "currency": "COP" } }
        ]
      },
      {
        "letter": "B",
        "seats": [
          { "id": "5e7a4f1b-0101", "number": 1, "row": "B", "type": "PREFERENTIAL", "state": "AVAILABLE", "price": { "amount": 20500, "currency": "COP" } },
          { "id": "5e7a4f1b-0102", "number": 2, "row": "B", "type": "ACCESSIBLE", "state": "AVAILABLE", "price": { "amount": 16500, "currency": "COP" } }
        ]
      }
    ]
  }
}
```

| Campo | Tipo | Notas |
|---|---|---|
| `layout.screenPosition` | enum | `top` \| `bottom` \| `left` \| `right` — dónde se dibuja la pantalla en relación con el mapa |
| `seat.id` | string | Identificador de silla por función (limitado a la función, no global) |
| `seat.type` | enum | `GENERAL` \| `PREFERENTIAL` \| `VIP` \| `DISABLED` \| `ACCESSIBLE` |
| `seat.state` | enum | `AVAILABLE` \| `RESERVED` \| `SOLD` \| `DISABLED` |
| `seat.price` | object | COP entero (convenciones §6); coincide con el precio base de su `seatType` |
| `seat.number` | integer | Número de exhibición dentro de la fila (para la etiqueta de la silla) |

## Respuestas de error
Todos los errores usan el envelope de convenciones §4. Códigos relevantes: `400`, `404`, `500`.

| HTTP | Código | Escenario | Comportamiento de frontend |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Formato de `functionId` inválido | Mostrar error genérico; bloquear la selección de sillas |
| 404 | `NOT_FOUND` | La función no existe / no es comprable | "La función ya no está disponible" + volver a la película |
| 500 | `SERVER_ERROR` | Falla inesperada del backend | Error recuperable con reintento (§13) |

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La función no está disponible",
    "requestId": "req_01HZ3KQ8VX2ZP9"
  }
}
```

## Consideraciones de frontend
- **Plano de sillas interactivo**: renderiza filas/columnas desde `layout`; dibuja un marcador de pantalla según `screenPosition`.
- **Leyenda** para cada estado — disponible / seleccionada / reservada / vendida / deshabilitada / preferencial / VIP (colorea los tipos de forma distinta y declara su significado).
- **Evitar seleccionar cualquier silla cuyo `state !== "AVAILABLE"`** (RESERVED/SOLD/DISABLED no son clicables o se muestran bloqueadas visiblemente).
- **Sondear cada ~30 s** vía `refetchInterval: 30000` (más `refetchOnWindowFocus`) para detectar cambios RESERVED/SOLD hechos por otros usuarios y por los holds con tiempo límite.
- Si una **silla previamente seleccionada deja de estar disponible** en un sondeo → mostrar una advertencia, quitarla de la selección y re-renderizar el total.
- **La selección se mantiene en estado local** (no se persiste) hasta que la llamada del hold tenga éxito.
- Las sillas accesibles (`type: ACCESSIBLE`) NO son seleccionables aquí — se reservan mediante un **flujo separado** (p. ej. solicitud de accesibilidad) — muestra una nota/enlace en su lugar.
- Clave de TanStack Query `["functionSeats", functionId]`; `staleTime` ~15 s dada la cadencia de sondeo.

## Reglas de validación
- `functionId` UUID v4 válido.
- Nunca enviar una silla cuyo último estado conocido no fuera `AVAILABLE`; re-verificar la selección contra el sondeo más fresco antes de hacer el hold.

## Reglas de negocio
- **Las sillas `RESERVED` (en hold de otros usuarios, incluidos los holds con tiempo límite) no son seleccionables.**
- **Las sillas `DISABLED` no están a la venta.**
- **Las sillas `ACCESSIBLE` se reservan mediante un flujo separado** (solicitud de asientos accesibles), no por la ruta estándar de clic para seleccionar.
- Los holds son de corta duración (con tiempo límite); una silla `RESERVED` puede volver a `AVAILABLE` cuando un hold expira.

## Notas de seguridad
- Endpoint público de lectura; `seat.id` está limitado a la función y no revela nada personal.
- El servidor hace cumplir la disponibilidad al crear el hold — el mapa es orientativo, la llamada del hold es autoritativa.

## Flujo de ejemplo
1. El usuario confirma una función → `GET /api/v1/functions/5e7a4f1b-.../seats` renderiza el plano.
2. El usuario toca una silla `AVAILABLE` → seleccionada localmente, el total se actualiza.
3. Un sondeo devuelve esa silla como `RESERVED` → advertencia mostrada, la silla se quita de la selección.
4. El usuario confirma → `POST /functions/{functionId}/seat-holds` persiste el hold (autenticado).
5. Un usuario de asientos accesibles toca una silla `DISABLED`/`ACCESSIBLE` → nota informativa sobre el flujo separado.
