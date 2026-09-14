# Páginas de autenticación

Las páginas coordinan el caso de uso completo. Conectan componentes visuales con servicios, sesión, store, notificaciones y navegación. No deberían contener componentes genéricos reutilizables.

## Estructura

- `login/`: pantalla de inicio de sesión.
- `forgot-password/`: pantalla para solicitar recuperación.
- `register/`: placeholder de registro pendiente de implementación.

## Patrón de implementación

Una página normalmente:

1. Lee el estado necesario de `useAuthStore` o `useSessionStore`.
2. Controla `isSubmitting` y otros estados propios de la pantalla.
3. Llama al servicio correspondiente dentro de un handler.
4. Actualiza sesión/store y muestra notificaciones.
5. Redirige usando `PATHS`, respetando el destino original cuando exista.
6. Renderiza el caso visual con `AuthLayout`.

Mantén el servicio y la validación fuera de la página cuando puedan reutilizarse. Agrega la ruta en `src/routes/appRouter.tsx` y su constante en `src/routes/paths.ts` cuando crees una pantalla nueva.
