# Estado de autenticación

`useAuthStore` es un store de Zustand para estado visual del login. Actualmente mantiene:

- `lockedUntil`: timestamp que indica hasta cuándo se bloquea el login.
- `loginErrorMessage`: mensaje devuelto por el backend para errores del login.

Sus acciones son `setLockout`, `setLoginErrorMessage` y `clearLoginFeedback`.

## Cómo funciona en el login

`LoginPage` lee el store. Si el backend devuelve `423`, guarda una fecha futura y un mensaje con `setLockout`; si devuelve `400` o `401`, guarda el mensaje con `setLoginErrorMessage`. `LoginForm` recibe esos valores como props y bloquea el envío cuando `lockedUntil` aún está vigente.

El access token y el `userId` se administran aparte mediante `useSessionStore` en `src/services/session`; no dupliques esos datos aquí.

## Cómo extenderlo

Agrega únicamente estado transversal y acciones pequeñas, con tipos explícitos. Actualiza la página consumidora y limpia los estados temporales después de un nuevo intento o una salida de sesión. Para estado exclusivo de una pantalla, usa `useState` en la página en lugar de ampliar este store.
