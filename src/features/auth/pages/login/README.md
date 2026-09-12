# Inicio de sesión

`LoginPage` es la pantalla que orquesta el acceso. Renderiza `AuthLayout` y `LoginForm`, recibe las credenciales, llama a `login` y persiste el resultado.

## Flujo actual

1. `LoginForm` valida y entrega `LoginFormData`.
2. `LoginPage` llama a `login`, que hace `POST /auth/login`.
3. El `accessToken` se guarda mediante `useSessionStore` y el usuario mediante `useAuthStore`.
4. Se muestra una notificación de éxito y se redirige a `location.state.from.pathname` o a `PATHS.home`.
5. Un `423` activa un bloqueo de 15 minutos; un `401` conserva el mensaje en el store; otros errores usan `notifyError`.

## Cómo implementarlo o modificarlo

Mantén `handleSubmit` como coordinador y deja la presentación en `LoginForm`. Para cambiar la duración del bloqueo, actualiza `LOCKOUT_DURATION_MS`. Para agregar un resultado del backend, ajusta primero las interfaces y el servicio, y después actualiza la persistencia de sesión.

Prueba al menos login exitoso, credenciales inválidas, cuenta bloqueada, error inesperado y redirección desde una ruta protegida.
