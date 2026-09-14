# Interfaces de autenticación

Aquí se definen los tipos que forman el contrato interno entre las páginas, los servicios y el store de autenticación.

## Tipos actuales

- `AuthUser`: usuario autenticado que conserva la aplicación (`id`, `name`, `email` y `role_id`).
- `LoginRequest`: credenciales enviadas al endpoint `POST /auth/login`.
- `LoginResponse`: respuesta del login, con `accessToken`, `refreshToken` y `user`.

## Cómo implementar cambios

Cuando se agregue un endpoint de auth:

1. Define aquí los tipos de request y response con los nombres y tipos del contrato de API.
2. Reutiliza `AuthUser` si la respuesta representa al mismo usuario.
3. Importa los tipos con `import type` desde `@features/auth/interfaces`.
4. Mantén los DTO de API separados de los tipos de UI si sus formas difieren.

Los contratos de backend son la fuente de verdad; revisa `docs/api/endpoints/05-auth/` antes de cambiar estas interfaces. No coloques lógica, validaciones ni llamadas HTTP en este directorio.
