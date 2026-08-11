# Routing

## Descripción

El sistema de enrutamiento es responsable de gestionar la navegación entre las diferentes vistas de la aplicación.

Su objetivo es mantener una navegación organizada, segura y escalable, facilitando el acceso a las funcionalidades según el estado de autenticación y el rol del usuario.

---

## Principios

- Cada ruta debe representar una funcionalidad específica.
- Las rutas deben mantenerse organizadas por módulos.
- Las rutas protegidas deben validar la autenticación del usuario.
- El acceso a funcionalidades deberá respetar los permisos definidos por el negocio.

---

## Tipos de rutas

### Rutas Públicas

Permiten el acceso sin necesidad de autenticación.

Ejemplos:

- Login
- Register
- Home
- Movies

---

### Rutas Protegidas

Requieren que el usuario haya iniciado sesión.

Ejemplos:

- Profile
- Purchase History
- Checkout

---

### Rutas por Rol

Algunas funcionalidades podrán restringirse según el rol del usuario.

Ejemplo:

- Administrator
- Employee
- Customer

---

## Organización

Las rutas deberán mantenerse agrupadas según la funcionalidad correspondiente.

La configuración del enrutamiento deberá permitir un crecimiento progresivo de la aplicación sin afectar los módulos existentes.

---

## Buenas prácticas

- Evitar rutas duplicadas.
- Utilizar nombres descriptivos.
- Centralizar la configuración de rutas.
- Mantener protegidas las rutas privadas.
- Evitar lógica de negocio dentro de la configuración del enrutamiento.

---

## Implementación actual

### Constantes de rutas

Los paths se centralizan en `src/routes/paths.ts` (`PATHS`) y se referencian desde la configuración del router y las guardas — nunca hardcodear URLs en componentes.

### Configuración del router

`src/routes/appRouter.tsx` define `createBrowserRouter` con tres grupos:

| Grupo     | Rutas                                                      | Guard                       |
| --------- | ---------------------------------------------------------- | --------------------------- |
| Público   | `/` (Home), `/auth/login`, `/auth/register`                | —                           |
| Solo público | envuelve login/register                                   | `PublicOnlyRoute`           |
| Protegido | `/profile`, `/purchase-history`, `/checkout`               | `ProtectedRoute`            |
| Catch-all | `*` (Página no encontrada)                                 | —                           |

Las páginas de negocio aún no existen; los placeholders se renderizan con `PlaceholderPage`.

### Guardas

Las guardas viven en `src/routes/guards/`:

- **`ProtectedRoute`**: si no hay `accessToken` en `useSessionStore` (`@services/session`), redirige a `/auth/login` con `replace` y guarda `state.from` (la ruta a la que se dirigía) para poder regresar tras autenticarse.
- **`PublicOnlyRoute`**: si el usuario ya está autenticado, redirige a `/`; evita que login/register se muestren a usuarios con sesión.

Ambas guardas son rutas layout sin path y usan `<Outlet />` para renderizar sus hijos. Sus tests (Vitest + React Testing Library) se colocalizan junto a cada guarda.
