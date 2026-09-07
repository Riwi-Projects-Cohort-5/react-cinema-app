# Checkbox

## Descripción

Primitiva de checkbox del sistema de diseño de **React Cinema App**. Vive en `src/shared/components/primitives/checkbox/Checkbox.tsx` y se construye sobre los tokens definidos en [Design tokens](../../../../../docs/design/11-design-tokens.md).

Se re-exporta desde el barrel de primitivas: `@shared/components/primitives` (ver [README de primitivas](../../README.md)).

## Componentes

| Componente | Export | Uso |
| ---------- | ------ | --- |
| `Checkbox` | `export const Checkbox` | Check estándar (token `primary`) |
| `CheckboxRobot` | `export const CheckboxRobot` | Check "no soy un robot" (token `success`) |

## Props

Ambos componentes comparten la misma API:

| Prop | Tipo | Default | Descripción |
| ---- | ---- | ------- | ----------- |
| `checked` | `boolean` | `undefined` | Estado controlado. Si se provee, el estado lo gestiona el padre vía `onChange`. |
| `onChange` | `(checked: boolean) => void` | — | Callback con el nuevo estado al alternar. Útil tanto en modo controlado como para reaccionar a un cambio no-controlado. |
| `defaultChecked` | `boolean` | `false` | Estado inicial en modo no-controlado. |
| `disabled` | `boolean` | `false` | Deshabilita la interacción y aplica `opacity-40`. |
| `className` | `string` | `""` | Clases adicionales sobre el contenedor. |
| `ariaLabel` | `string` | — | Nombre accesible directo (`aria-label`) sobre el `role="checkbox"`. |
| `ariaLabelledBy` | `string` | — | Id de un elemento que nombra el checkbox (`aria-labelledby`). |

Los componentes no son `checked` por defecto: el valor inicial en modo no-controlado es `false`.

## Uso

Importación desde el barrel:

```tsx
import { Checkbox, CheckboxRobot } from "@shared/components/primitives";
```

### No-controlado (recomendado para formularios simples)

```tsx
<Checkbox />
<Checkbox defaultChecked />   // inicia marcado
```

### Controlado

Cuando el estado debe vivir en el padre (por ejemplo, para validar términos o persistir):

```tsx
import { useState } from "react";
import { Checkbox } from "@shared/components/primitives";

const AceptoTerminos = () => {
  const [acepto, setAcepto] = useState(false);

  return (
    <Checkbox checked={acepto} onChange={setAcepto} />
  );
};
```

`onChange` recibe directamente el nuevo valor booleano, por lo que `setAcepto` puede pasarse tal cual.

### CheckboxRobot ("no soy un robot")

Estilo reCAPTCHA con acento en el token `success`:

```tsx
import { useState } from "react";
import { CheckboxRobot } from "@shared/components/primitives";

const VerificacionRobot = () => {
  const [verificado, setVerificado] = useState(false);

  return (
    <CheckboxRobot checked={verificado} onChange={setVerificado} />
  );
};
```

### Con texto / etiqueta

El componente es un `div` con `role="checkbox"` — no un `<input>` — por lo que un `<label>` nativo **no** activa el toggle al hacer clic sobre el texto. Si se quiere clickear también la etiqueta, ampliar el target de clic desde el contenedor y dejar que **un solo elemento** gestione el toggle para evitar un doble disparo por burbujeo:

```tsx
const FilaAcepto = ({ checked, onChange }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label
    className="flex cursor-pointer items-center gap-2"
    onClick={() => onChange(!checked)}
  >
{/* Sin onChange: aquí el Checkbox es presentacional; el label gestiona el toggle
        y evita que el clic sobre la caja dispare dos veces. */}
    <Checkbox checked={checked} />
    Acepto los términos y condiciones
  </label>
);
```

Nota: pasar también `onChange` al `<Checkbox>` interno haría que un clic sobre la caja ejecute el `onClick` del checkbox y luego burbujee al `onClick` del `<label>`, revirtiendo el estado (doble toggle).

### Deshabilitado

```tsx
<Checkbox disabled />
<Checkbox checked disabled />
<CheckboxRobot disabled />
```

## Accesibilidad

- `role="checkbox"`, `aria-checked` y `aria-disabled` gestionados automáticamente.
- **Nombre accesible obligatorio:** al ser un `div` sin texto visible, hay que nombrarlo vía `aria-label` o `aria-labelledby`. Sin nombre, los lectores de pantalla anunciarán sólo "checkbox, no marcado".
- Navegación por teclado: `tabIndex={0}` y alternancia con `Espacio` / `Enter`.
- En estado `disabled`, `tabIndex={-1}`, `opacity-40` y bloqueo del toggle.
- El foco visible sigue la regla global de [Accesibilidad](../../../../../docs/design/15-accesibilidad.md) (outline `primary` de 2px).

**Nota de tamaño de área táctil:** la caja visible mide `18px` (`Checkbox`) y `22px` (`CheckboxRobot`). Las pautas de accesibilidad recomiendan un área táctil mínima de `44px`; al integrarlo en un formulario real conviene envolverlo en un contenedor clickeable más grande (ver el patrón "Con texto / etiqueta").

## Diseño

| Elemento | Checkbox | CheckboxRobot |
| -------- | -------- | ------------- |
| Tamaño caja | `1.125rem` (18px) | `1.375rem` (22px) |
| Radio | `rounded-xs` (`--radius-xs`) | `rounded-xs` (`--radius-xs`) |
| Borde | 1px, `border-border` | 2px, `border-border` |
| Checked | `bg-primary` / `border-primary` | `bg-success` / `border-success` |
| Unchecked | `bg-transparent` | `bg-background` |
| Ícono | Phosphor `Check`, `size={16}`, `weight="bold"` | idem |

- Colores por token: `primary` (`#5b5fef`), `success` (`#3dd68c`), `border` (`#272b36`), `background` (`#0a0b10`).
- Ícono según convención de [Iconografía](../../../../../docs/design/10-iconografia.md): variante **Bold** para estados activos/seleccionados, tamaño base `icon-sm` (16px), color siempre `text-white` en estado checked (pares con contraste validado: `#FFFFFF` sobre `primary`/`success`).
- Transición de color con `duration-fast` (150ms).
- Soporta tema `dark` y `light` (`data-theme`) por estar basado en tokens.
- Los `className` condicionales (estado `checked`/`disabled`, `${className}` del consumidor) se componen con el util compartido [`cn`](../../README.md#composición-de-clases-cn), sin `!important`.

## Documentos relacionados

- [Primitivas](../../README.md)
- [Design tokens](../../../../../docs/design/11-design-tokens.md)
- [Iconografía](../../../../../docs/design/10-iconografia.md)
- [Accesibilidad](../../../../../docs/design/15-accesibilidad.md)
- [Path aliases](../../../../../docs/frontend-architecture/development/path-aliases.md) — alias `@shared/*`