# Componentes de autenticación

Esta carpeta contiene componentes visuales reutilizables que representan partes del flujo de autenticación. La lógica de navegación, sesión y llamadas HTTP debe permanecer en las páginas y servicios correspondientes.

## `LoginForm`

`LoginForm` mantiene el estado local de `email`, `password`, visibilidad de la contraseña y `rememberMe`. Antes de enviar:

1. Evita el envío si el formulario está bloqueado o ya se está enviando.
2. Recorta correo y contraseña.
3. Ejecuta `loginSchema` mediante `useFormValidation`.
4. Invoca `onSubmit` con un `LoginFormData` válido.

También muestra errores de campo, un mensaje general y el estado de carga recibido por props.

## Cómo implementarlo

Usa el componente desde una página y conserva la operación de autenticación en esa página:

```tsx
<LoginForm
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  isLocked={isLocked}
  feedbackMessage={loginErrorMessage}
/>
```

Para crear otro componente de auth, define una API de props pequeña, reutiliza los componentes de `src/shared/components` y deja los efectos secundarios fuera del componente visual. Exporta el componente desde `index.ts` para mantener el alias de importación estable.

## Nota

Los botones de Google y Apple están presentes como UI, pero todavía no conectan con un proveedor OAuth.
