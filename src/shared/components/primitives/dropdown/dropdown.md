# Dropdown

## Descripción

Primitiva de selección (combobox) del sistema de diseño de **React Cinema App**. Vive en `src/shared/components/primitives/dropdown/Dropdown.tsx` y se construye sobre los tokens definidos en [Design tokens](../../../../../docs/design/11-design-tokens.md).

Incluye **navegación por teclado** (WAI-ARIA APG combobox) y **filtrado de opciones** opcional.

Se re-exporta desde el barrel de primitivas: `@shared/components/primitives` (ver [README de primitivas](../../README.md)).

## Props

| Prop | Tipo | Default | Descripción |
| ---- | ---- | ------- | ----------- |
| `options` | `DropdownOption<V>[]` | — | Lista de opciones. **Requerido.** |
| `label` | `string` | — | Etiqueta superior (estilo overline, uppercase). |
| `optionalHint` | `string` | — | Texto auxiliar junto a la etiqueta, ej. `"(opcional)"`. |
| `placeholder` | `string` | `"Seleccionar…"` | Texto cuando no hay selección. |
| `value` | `V \| null` | `undefined` | Valor controlado. |
| `onChange` | `(value: V \| null) => void` | — | Callback al seleccionar. |
| `defaultValue` | `V \| null` | `null` | Valor inicial no-controlado. |
| `filterable` | `boolean` | `false` | Muestra un campo de búsqueda sobre el listado. |
| `filter` | `(option, query) => boolean` | `includes` case-insensitive | Predicado de filtrado personalizado. |
| `filterPlaceholder` | `string` | `"Buscar…"` | Placeholder del campo de búsqueda. |
| `disabled` | `boolean` | `false` | Deshabilita el control (`opacity-40`, bloqueo). |
| `id` | `string` | — | Identificador del elemento raíz. |
| `className` | `string` | `""` | Clases sobre el contenedor raíz. |
| `listClassName` | `string` | `""` | Clases sobre el `<ul role="listbox">`. |
| `triggerIcon` | `ReactNode` | — | Ícono lead dentro del trigger (antes del texto). |
| `triggerClassName` | `string` | `""` | Clases sobre el `<button>` trigger; al componerse con `cn` (que usa `tailwind-merge`), sobreescriben el estilo base del trigger. |

### `DropdownOption<V>`

| Campo      | Tipo        | Descripción                                               |
| ---------- | ----------- | --------------------------------------------------------- |
| `value`    | `V`         | Valor de la opción (idealmente primitivo: string/number). |
| `label`    | `string`    | Texto visible.                                            |
| `disabled` | `boolean`   | Opción no seleccionable (se salta con teclado).           |
| `icon`     | `ReactNode` | Ícono lead opcional (ej. bandera, globo).                 |

## Uso

Importación desde el barrel:

```tsx
import { Dropdown } from "@shared/components/primitives";
```

### Básico (no-controlado)

```tsx
<Dropdown
  options={[
    { value: "co", label: "Colombia" },
    { value: "ar", label: "Argentina" },
  ]}
  label="País"
  placeholder="Selecciona un país"
/>
```

### Controlado

```tsx
import { useState } from "react";
import { Dropdown } from "@shared/components/primitives";

const SelectorCiudad = () => {
  const [ciudad, setCiudad] = useState<string | null>(null);

  return (
    <Dropdown
      options={ciudades}
      label="Ciudad"
      value={ciudad}
      onChange={setCiudad}
      placeholder="Selecciona tu ciudad"
    />
  );
};
```

### Con filtrado de opciones

```tsx
<Dropdown options={ciudades} label="Ciudad" filterable placeholder="Selecciona tu ciudad" />
```

Al abrir, el foco va al campo de búsqueda; escribir filtra la lista y `Enter` selecciona el resultado resaltado.

> El campo de búsqueda utiliza la primitiva **`Input`** (`type="search"`). Como `Input` no reenvía props de ARIA/teclado, el patrón combobox (`role`, `aria-*`, keydown) se sincroniza sobre el input nativo vía `ref` + `useEffect`. El aspecto sin borde/fondo/ring se logra con overrides por especificidad `[&_input:]` aplicados en el wrapper (sin `!important`).

### Con ícono y opción opcional

```tsx
<Dropdown
  options={[{ value: "c1", label: "Complejo Central", icon: <Building size={16} /> }]}
  label="Complejo / Teatro"
  optionalHint="opcional"
  placeholder="Selecciona un complejo"
/>
```

### Trigger personalizado (pill de ubicación)

`triggerIcon` agrega un ícono lead dentro del trigger y `triggerClassName` sobreescribe el estilo del botón al componerse con `cn` + `tailwind-merge`, lo que permite reusar la primitiva como pill compacta en el header:

```tsx
import { MapPinIcon } from "@phosphor-icons/react";
import { cn } from "@shared/utils/cn";

<Dropdown
  options={[
    { value: "Barranquilla", label: "Barranquilla" },
    { value: "Cali", label: "Cali" },
  ]}
  defaultValue="Barranquilla"
  triggerIcon={<MapPinIcon size={18} weight="fill" className="text-primary" />}
  triggerClassName={cn(
    "h-auto w-auto gap-2 rounded-full bg-surface-variant px-4 py-2 text-sm",
    "border-transparent outline outline-1 outline-offset-[-1px] outline-border",
  )}
/>
```

## Teclado

| Tecla                            | Acción                                                 |
| -------------------------------- | ------------------------------------------------------ |
| `Enter` / `Space` / `ArrowDown`  | Abre el listado (si está cerrado).                     |
| `ArrowDown` / `ArrowUp`          | Mueve el resaltado (cicla, salta opciones `disabled`). |
| `Home` / `End`                   | Salta a la primera / última opción.                    |
| `Enter`                          | Selecciona la opción resaltada.                        |
| `Escape`                         | Cierra (y limpia el filtro).                           |
| `Tab`                            | Cierra y sigue la navegación.                          |
| Escribir en el campo de búsqueda | Filtra opciones (`filterable`).                        |

## Accesibilidad

La primitiva implementa el patrón **combobox + listbox** de WAI-ARIA APG:

- Trigger con `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls` y `aria-activedescendant`.
- En modo `filterable`, al abrir el patrón combobox se traslada al campo de búsqueda (que recibe el foco): `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` y `aria-autocomplete="list"` sobre el input, para que el lector de pantalla anuncie la opción resaltada mientras se filtra.
- Listado con `role="listbox"`/`role="option"` y `aria-selected`.
- Foco restaurado al cerrar y cierre con click fuera y `Escape`.
- En estado `disabled`: bloqueo de interacción y `opacity-40`.
- El campo de búsqueda del popover no muestra anillo de foco (`outline-hidden`): el foco se indica con el caret y el contexto del popover, a pedido del equipo. Los overrides sobre la primitiva `Input` (borde `border-0`, fondo `bg-transparent`, ausencia de ring y placeholder `text-text-secondary`) se aplican desde el wrapper de la fila de búsqueda con variantes de especificidad `[&_input:]` (selector `.wrapper input`), evitando el uso de `!important`.

**Nota:** este patrón reemplaza justificadamente el `role="menu"`/`menuitem` sugerido en [Accesibilidad](../../../../../docs/design/15-accesibilidad.md): el patrón menu sirve para acciones de menú, no para selección con filtrado y type-ahead (el APG de `menuitem` no define navegación por texto ni `aria-activedescendant`).

## Diseño

| Elemento         | Token                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| Alto del campo   | `h-12` (48px, grid 4px)                                                     |
| Radio            | `rounded-md` (`--radius-md`)                                                |
| Fondo campo      | `bg-background` (`--color-background`)                                      |
| Borde            | `border-border` (1px); `border-primary` al abrir                            |
| Texto valor      | `text-body` + `text-text-primary`                                           |
| Placeholder      | `text-text-secondary`                                                       |
| Etiqueta         | `text-overline` + `uppercase` + `tracking-overline` + `text-text-secondary` |
| Popover          | `bg-surface` + `border-border` + `shadow-md`                                |
| Opción resaltada | `bg-surface-variant`                                                        |
| Seleccionada     | `Check` Phosphor `weight="bold"` `text-primary`                             |
| Íconos           | Phosphor: `CaretDown`, `MagnifyingGlass`, `Check`                           |

- Íconos según convención de [Iconografía](../../../../../docs/design/10-iconografia.md): variante **Bold** para estados activos/seleccionados, tamaño base `icon-sm` (16px).
- Transición de color con `duration-fast` (150ms).
- Valores fuera del sistema del Figma (altura 45/47px, radio 11px, texto 14px) mapeados a tokens del grid (48px, `radius-md`, `text-body`).

## Documentos relacionados

- [Primitivas](../../README.md)
- [Checkbox](../checkbox/checkbox.md) — patrón de estado controlado/no-controlado equivalente.
- [Design tokens](../../../../../docs/design/11-design-tokens.md)
- [Iconografía](../../../../../docs/design/10-iconografia.md)
- [Accesibilidad](../../../../../docs/design/15-accesibilidad.md)
- [Path aliases](../../../../../docs/frontend-architecture/development/path-aliases.md) — alias `@shared/*`
