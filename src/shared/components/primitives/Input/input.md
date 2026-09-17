# Input

## ¿Qué es?

`Input` es el componente base para campos de formulario del sistema. Sirve como primitive reutilizable para entradas de texto, correo, contraseña, número, fecha, select y textarea.

Su propósito es ser un control simple, estándar y accesible, sin acoplarse a la lógica de un formulario concreto. Por eso no depende de `FormField`, `useFormField` ni de validación con Zod.

## ¿Cuándo usarlo?

Usa `Input` cuando:

- el campo no está dentro de un `FormField`
- quieres renderizar un control aislado y reutilizable
- necesitas un componente base que funcione como entrada estándar
- quieres controlar la interfaz manualmente en una pantalla o un flujo simple

## ¿Cuándo no usarlo?

No lo uses directamente cuando:

- el campo forma parte de un formulario con `FormField`
- quieres integrar validación, errores y contexto del formulario
- necesitas que el campo esté sincronizado con la estructura del wrapper del formulario

En esos casos, el uso correcto es con `FormInput` y `FormField`.

## Patrón recomendado

### 1. Primitive

```tsx
import Input from "@/shared/components/primitives/Input";

<Input
  label="Correo"
  type="email"
  placeholder="usuario@ejemplo.com"
  helperText="Usaremos este correo para enviarte la confirmación"
/>;
```

### 2. Formulario con contexto

```tsx
import { FormField, FormInput } from "@/shared/components/composites/forms";

<FormField id="email" label="Correo" error={errors.email} required>
  <FormInput name="email" type="email" />
</FormField>;
```

## Diferencia entre `Input` y `FormInput`

### `Input`

- es el componente base
- no asume reglas de formulario
- es usado en contexto manual o standalone
- maneja label, helper text, error y accesibilidad de forma local

### `FormInput`

- es el adapter para formularios
- toma el contexto del `FormField`
- resuelve label, error y helper text del contexto
- evita duplicación visual y lógica de render
- se usa en los formularios del sistema

## Props principales

### Base

- `type`: tipo del campo (`text`, `email`, `password`, `number`, `date`, `textarea`, `select`)
- `label`: texto del label
- `placeholder`: placeholder del campo
- `helperText`: texto de ayuda
- `errorMessage`: mensaje explícito de error
- `error`: error ya resuelto por el contexto de formulario
- `state`: `idle | error | disabled`
- `required`: marca el campo como obligatorio

### HTML

- `name`, `id`, `value`, `onChange`, `onBlur`, `autoComplete`
- `className`
- `rows` para textarea
- `options` y `selectPlaceholder` para selects

### Accesibilidad

- `aria-invalid`
- `aria-describedby`
- `showLabel`
- `showMessage`

## Reglas de accesibilidad

El componente debe garantizar que:

- el campo tiene un `id` válido
- el error y el helper tienen `id` propio
- `aria-describedby` referencia esos ids reales
- el estado de error refleja un `aria-invalid="true"`
- el texto de ayuda no quede “desconectado” del campo

Esto evita que lectores de pantalla no puedan anunciar el mensaje asociado.

## Fallback de ids

Si no se envía `id`, el componente genera uno con `React.useId()`. Esto evita ids indefinidos y garantiza que los mensajes asociados puedan enlazarse correctamente al campo.

## Convención del proyecto

La regla institucional es:

- `Input` para uso aislado
- `FormField` + `FormInput` para formularios con contexto

No se debe mezclar ambos patrones dentro del mismo flujo sin intención clara. Si un campo vive dentro de un formulario, debe integrarse con el contexto del formulario para evitar duplicación y errores de accesibilidad.

## Ejemplo completo

```tsx
import Input from "@/shared/components/primitives/Input";

export const Example = () => (
  <Input
    label="Nombre"
    name="name"
    type="text"
    placeholder="Escribe tu nombre"
    helperText="Se mostrará en tu perfil"
    required
  />
);
```

## Ejemplo con validación de formulario

```tsx
import { FormField, FormInput } from "@/shared/components/composites/forms";

<FormField id="email" label="Correo" error={errors.email} required>
  <FormInput name="email" type="email" />
</FormField>;
```

## Importante

La lógica de validación y contextos de formulario no vive en la primitiva. Mantener esa separación hace que el componente sea más reutilizable, más fácil de testear y más consistente con la arquitectura del proyecto.
