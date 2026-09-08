# Flashbar

Banner de avisos persistentes a nivel de sistema fijado arriba del viewport (`fixed inset-x-0 top-0 z-50`, `h-14`), basado en el Figma "Flashbar" (MULT-243). Borde superior/inferior e izquierdo (3px) en el tono, badge de ícono, título, separador, mensaje, chip de cuenta regresiva opcional, acción opcional y botón de cierre opcional.

Tones: `accent` (default), `success`, `info`, `warning`, `error`. `role="status"`; `role="alert"` en tono error. Compone `IconBadge`, `Countdown` e `IconLink` de `@shared/components/primitives`.

## Props

| Prop                | Tipo           | Default        | Descripción                                                         |
| ------------------- | -------------- | -------------- | ------------------------------------------------------------------- |
| `title`             | `string`       | —              | Título del aviso.                                                   |
| `message`           | `string`       | —              | Mensaje (trunca).                                                   |
| `icon`              | `ReactNode`    | Ícono del tono | Ícono del badge (override).                                         |
| `countdownSeconds`  | `number`       | —              | Muestra el chip `Countdown` con esta duración.                      |
| `onCountdownExpire` | `() => void`   | —              | Al llegar el countdown a cero.                                      |
| `actionLabel`       | `string`       | —              | Texto de la acción; se renderiza solo si hay `actionTo`/`onAction`. |
| `actionTo`          | `string`       | —              | Ruta (link).                                                        |
| `onAction`          | `() => void`   | —              | Callback de la acción (botón).                                      |
| `onDismiss`         | `() => void`   | —              | Renderiza el botón de cierre.                                       |
| `tone`              | `FlashbarTone` | `"accent"`     | Tono de acento.                                                     |
| `fixed`             | `boolean`      | `true`         | `fixed` al tope del viewport o `relative` (inline).                 |
| `className`         | `string`       | —              | Clases adicionales.                                                 |

## Tonos

Soporta `accent` (default), `success`, `info`, `warning` y `error`: texto, borde superior/inferior,
borde izquierdo 3px, fondo del `IconBadge`, ícono default y `role` (`status`, o `alert` en tono
`error`) se derivan del tono.

**Posibilidad**: dirigir el tono desde el backend. El contrato `GET /cineflash` no expone un campo
de tono/severidad, por eso `CineFlashBanner` renderiza con el default `accent`. Si el backend agrega
ese campo, basta con mapearlo en `CineFlashBanner` (cambio de contrato — requiere acuerdo con
backend/producto).

## Ejemplo

```tsx
import { Flashbar } from "@features/flashbar/components";

<Flashbar
  title="Cine Flash"
  message={data.terms}
  countdownSeconds={data.remainingSeconds}
  onCountdownExpire={invalidate}
/>;
```
