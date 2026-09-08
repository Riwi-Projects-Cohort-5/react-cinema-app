# Primitivas

## Descripción

Componentes primitivos del sistema de diseño de **React Cinema App**. Cada primitiva vive en su propia carpeta (`kebab-case/`) con su componente y su documentación colocated, y se re-exporta desde el barrel `index.ts` de esta carpeta.

Importación recomendada (desde el barrel):

```tsx
import { Checkbox, CheckboxRobot } from "@shared/components/primitives";
```

## Catálogo

| Primitiva | Descripción |
| --------- | ----------- |
| [Checkbox](./checkbox/checkbox.md) | Check interactivo. Variante estándar (token `primary`) y "no soy un robot" (token `success`). |
| [Dropdown](./dropdown/dropdown.md) | Select (combobox) con navegación por teclado y filtrado de opciones opcional. |
| [Input](./Input.tsx) | Campo de texto, textarea y select con variantes, estados, iconos y soporte para helper/error messages. |

## Composición de clases (`cn`)

Las primitivas componen sus `className` condicionales con el util compartido **`cn`** (`@shared/utils/cn`), un joiner de clases tipo `clsx` que filtra valores falsy:

```tsx
import { cn } from "@shared/utils/cn";

className={cn(
  "flex items-center gap-2",
  disabled && "cursor-not-allowed opacity-40",
  className,
)}
```

**Regla del sistema:** no se usan clases con `!important` (`!border-0`, etc.). Cuando una primitiva necesita anular estilos de otra, el override se resuelve por **especificidad** (p. ej. variantes `[&_input:]` sobre el wrapper) en lugar de `!`.

## Cómo agregar una primitiva

1. Crear la carpeta `primitives/<nombre>/` (kebab-case).
2. Agregar el componente `<Nombre>.tsx` (PascalCase).
3. Agregar el doc colocated `<nombre>.md`.
4. Re-exportar el componente en `primitives/index.ts` (barrel).
5. Agregar una fila a la tabla del catálogo.