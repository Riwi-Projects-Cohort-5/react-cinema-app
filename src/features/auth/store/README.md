# Estado de autenticación

`useAuthStore` es un store de Zustand para estado de autenticación que no corresponde al token de transporte. Actualmente mantiene:

- `user`: usuario autenticado o `null`.
- `lockedUntil`: timestamp que indica hasta cuándo se bloquea el login.
- `loginErrorMessage`: mensaje de credenciales inválidas.

Sus acciones son `setUser`, `setLockout`, `setLoginErrorMessage` y `clearLoginFeedback`.

## Cómo funciona en el login

`LoginPage` lee el store. Si el backend devuelve `423`, guarda una fecha futura y un mensaje con `setLockout`; si devuelve `401`, guarda el mensaje con `setLoginErrorMessage`. `LoginForm` recibe esos valores como props y bloquea el envío cuando `lockedUntil` aún está vigente.

El access token se administra aparte mediante `useSessionStore` en `src/services/session`; no dupliques tokens aquí.

## Cómo extenderlo

Agrega únicamente estado transversal y acciones pequeñas, con tipos explícitos. Actualiza la página consumidora y limpia los estados temporales después de un nuevo intento o una salida de sesión. Para estado exclusivo de una pantalla, usa `useState` en la página en lugar de ampliar este store.
