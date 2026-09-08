# Interfaces Cine Flash (`interfaces/cineflash.ts`)

Modelos del contrato `GET /cineflash`. `CineFlashResponse`:

| Campo                   | Tipo                  | Descripción                                                |
| ----------------------- | --------------------- | ---------------------------------------------------------- |
| `active`                | `boolean`             | Banner activo/publicado.                                   |
| `discountPercent`       | `number`              | Tope del descuento de la promo.                            |
| `maxTicketsPerPurchase` | `number`              | Límite de entradas por compra.                             |
| `notAccumulableWith`    | `string[]`            | Promociones no acumulables.                                |
| `window`                | `CineFlashWindow`     | Ventana `{ startAt, endAt }`.                              |
| `remainingSeconds`      | `number`              | Cuenta regresiva viva del servidor.                        |
| `terms`                 | `string`              | Términos — mensaje del banner.                             |
| `functions`             | `CineFlashFunction[]` | Funciones con descuento (para la sección "Ver funciones"). |

Nota: el contrato no expone un campo de tono/severidad; por eso `CineFlashBanner` usa el default
`accent` (ver `flashbar.md` para la posibilidad de agregarlo).
