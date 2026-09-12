# Servicios de autenticación

Los servicios encapsulan las llamadas HTTP del feature. `auth.services.ts` importa `httpClient`, envía los DTO tipados y devuelve `data`, de modo que las páginas no conocen detalles de Axios ni de la configuración HTTP.

## Servicio actual

`login(payload: LoginRequest): Promise<LoginResponse>` realiza `POST /auth/login` y devuelve tokens junto con el usuario. Los errores son propagados para que la página decida cómo presentarlos.

## Cómo implementar un servicio

```ts
export async function requestPasswordReset(
  payload: PasswordResetRequest,
): Promise<PasswordResetResponse> {
  const { data } = await httpClient.post<PasswordResetResponse>(
    "/auth/password-reset",
    payload,
  );
  return data;
}
```

Define primero las interfaces, usa `httpClient` en lugar de `fetch` directo, tipa la respuesta y exporta la función desde `index.ts`. No muestres notificaciones ni modifiques Zustand aquí: esas decisiones pertenecen a la página o al caso de uso que consume el servicio.
