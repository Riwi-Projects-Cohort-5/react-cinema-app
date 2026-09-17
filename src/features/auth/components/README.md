# Componentes de autenticación

En esta carpeta dejé los componentes visuales reutilizables del flujo de autenticación. Mantengo la navegación, la sesión y las llamadas HTTP en las páginas y servicios correspondientes.

## `LoginForm`

En `LoginForm` mantengo el estado local de `email`, `password`, visibilidad de la contraseña y `rememberMe`. Antes de enviar:

1. Evita el envío si el formulario está bloqueado o ya se está enviando.
2. Recorta correo y contraseña.
3. Ejecuta `loginSchema` mediante `useFormValidation`; el login solo exige que la contraseña no esté vacía.
4. Invoca `onSubmit` con un `LoginFormData` válido.

El correo conserva el color normal del texto cuando tiene un error; el color de error queda reservado para el borde y el mensaje debajo del campo. Para la contraseña uso `passwordBasicSchema`, que solo exige presencia. Cuando contiene algún valor, muestro el `GreenIndicator` existente del sistema de diseño.

Los botones sociales usan los SVG ubicados en `public/google.svg` y `public/apple.svg`. Actualmente son elementos visuales y todavía no conectan con proveedores OAuth.

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

Para crear otro componente de auth, defino una API de props pequeña, reutilizo los componentes de `src/shared/components` y dejo los efectos secundarios fuera del componente visual. Exporto el componente desde `index.ts` para mantener el alias de importación estable.
