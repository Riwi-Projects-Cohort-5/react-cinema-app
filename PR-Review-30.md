# PR Review — 🔴 Rechazado

## Resumen

El PR implementa la infraestructura base de un sistema de validación genérico con Zod: esquemas reutilizables, hook `useFormValidation` y actualización del componente `Input` con soporte de validación onBlur. La arquitectura propuesta es correcta y los schemas están bien diseñados, pero el PR presenta 11 errores de ESLint que rompen la verificación de calidad del proyecto, uso masivo de `any` que contradice el criterio de "tipado completo con TypeScript", código muerto sin eliminar y código duplicado no extraído.

<details>
<summary><h2>🔴 Bloqueantes</h2></summary>

| Problema                                                                                                                                                                                                                                                                           | Cambio requerido                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **11 errores de ESLint en archivos modificados/creados**<br>Ejecutar `npx eslint` sobre `Input.tsx` y `src/shared/validation/` arroja 11 errores (`@typescript-eslint/no-unused-vars` y `@typescript-eslint/no-explicit-any`). Esto rompe la verificación de calidad del proyecto. | Corregir los 11 errores de lint antes de solicitar merge. |
| **`fieldSchema: any` en `InputProps` (Input.tsx:34)**<br>`fieldSchema?: any` permite pasar cualquier valor sin validación TypeScript. El PR declara "tipado completo con TypeScript" pero esta prop acepta literalmente cualquier cosa.                                            | Tipar como `fieldSchema?: ZodType` o `ZodType<unknown>`.  |
| **`any` en función `validateField` del hook (useFormValidation.ts:19)**<br>`value: any` acepta cualquier tipo sin restricción de tipos.                                                                                                                                            | Usar tipo genérico o `unknown` con validación de runtime. |

</details>

<details>
<summary><h2>🔴 Criterios afectados</h2></summary>

| Criterio                           | Estado | Evidencia                                                                                                                                     |
| ---------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipado completo con TypeScript     | ❌     | 11 errores de lint por uso de `any` en Input.tsx:34,36 y useFormValidation.ts:7,19,30,47,50                                                   |
| Mensajes de error claros por campo | ⚠️     | `validationMessages.ts` creado pero nunca integrado — los mensajes en `authSchemas.ts` están hardcodeados inline, no consumen `fieldMessages` |
| Integrado con Input existente      | ✅     | Input.tsx fue modificado correctamente con props de validación                                                                                |

</details>

<details>
<summary><h2>🔴 Comparación visual</h2></summary>

N/A — El PR no incluye cambios visuales en su alcance.

</details>

<details>
<summary><h2>🟡 Observaciones</h2></summary>

- **Código muerto sin limpiar:** `import type { ZodType }` en Input.tsx:2 no se usa. La función `getHelperClasses` en línea 80 fue reemplazada por lógica inline pero no fue eliminada. La variable `showMessage` en línea 254 se asigna pero nunca se referencia.
- **Lógica `onBlur` duplicada 3 veces:** El mismo handler idéntico (`if (onBlurValidation && fieldSchema && fieldName) { onBlurValidation(...) }`) se repite en TextInput (línea 231), TextArea (línea 206) y SelectInput (línea 219). Debería extraerse a una función auxiliar.
- **`validationMessages.ts` es dead code:** El archivo se crea, se exporta desde `index.ts`, pero ningún componente lo importa ni lo usa. Si no va a integrarse en este PR, considerar no incluirlo para mantener el alcance limpio.
- **`validateForm` no maneja paths anidados:** En useFormValidation.ts:50, `err.path[0]` asume que los paths de Zod siempre son planos. Un esquema con objetos anidados generaría `path: ["field", "nested"]` y solo se tomaría el primer nivel.
- **Prioridad de mensajes en Input inconsistente:** La condición `(error || (isError && errorMessage) || helperText)` en Input.tsx:268 puede mostrar el prop `error` aunque el estado del Input sea `idle`, lo cual visualmente es confuso.
- **`showMessageClass` hardcodeado:** En Input.tsx:255 se reemplazó `getHelperClasses(state)` por un string inline. La función `getHelperClasses` quedó como dead code y se perdió la abstracción.

</details>

<details>
<summary><h2>✅ Checklist</h2></summary>

### Arquitectura y organización

- [x] Respeta la arquitectura definida.
- [x] Mantiene la organización por features.
- [x] Los cambios pertenecen al dominio correcto.

### Código

- [ ] Nombres y tipos consistentes.
- [ ] Mantiene buenas prácticas.
- [ ] No introduce errores de lint/build.
- [ ] Evita código duplicado o innecesario.

### Funcionalidad

- [x] Cumple los criterios de aceptación.
- [ ] Maneja estados necesarios (loading, error, vacío).
- [x] Implementa integraciones requeridas.
- [x] Tiene comportamiento responsive cuando aplica.

### Documentación

- [x] Documentación actualizada cuando corresponde.
- [x] Sigue las convenciones del proyecto.
- [x] No duplica documentación existente.

</details>

## Resultado

🔴 Rechazado: corregir los bloqueantes (11 errores de lint, tipado `any` en Input y hook, código muerto) y solicitar una nueva revisión.
