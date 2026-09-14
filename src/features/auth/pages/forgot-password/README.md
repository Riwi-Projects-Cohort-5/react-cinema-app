# Recuperación de contraseña

`ForgotPasswordPage` presenta un formulario flotante, centrado dentro de la mitad derecha de la sección y sin card visible, para capturar el correo y solicitar un enlace de recuperación. Actualmente mantiene `email` y `busy` localmente, muestra `AuthLayout` sin activar `formCard` y simula la respuesta con un `setTimeout` de 800 ms. El título editorial se fuerza en dos líneas para respetar el diseño visual.

## Estado actual

La pantalla todavía no llama a un servicio ni valida el correo con un schema compartido. Por tanto, el botón confirma únicamente el estado visual de carga; no se envía ningún correo.

## Cómo completar la implementación

1. Añade en `interfaces/` el request y response definidos por el endpoint de recuperación.
2. Implementa una función en `services/` que use `httpClient`.
3. Sustituye el `setTimeout` por `await requestPasswordReset({ email })` dentro de `handleSubmit`.
4. Valida el correo con `useFormValidation` y el schema correspondiente.
5. Maneja errores con `ApiError`/`notifyError` y muestra una confirmación sin revelar si el correo existe.
6. Agrega la ruta de restablecimiento si el backend devuelve un token o enlace.

El enlace de retorno al login usa `PATHS.auth.login`; conserva esa constante en lugar de escribir rutas literales.
