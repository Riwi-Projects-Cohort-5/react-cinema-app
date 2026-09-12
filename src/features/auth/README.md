# Auth (colocado)

Esta documentación está colocada en `src/features/auth` y describe la implementación actual del módulo de autenticación. Cada carpeta tiene una guía local con su responsabilidad, flujo y forma de extensión.

## Documentación por carpeta

- [components](./components/README.md): componentes visuales reutilizables, incluido `LoginForm`.
- [interfaces](./interfaces/README.md): contratos tipados de requests, responses y usuario.
- [layouts](./layouts/README.md): composición compartida mediante `AuthLayout`.
- [pages](./pages/README.md): coordinación de las pantallas de autenticación.
- [pages/login](./pages/login/README.md): flujo de inicio de sesión.
- [pages/forgot-password](./pages/forgot-password/README.md): estado actual y pasos para completar recuperación.
- [services](./services/README.md): integración HTTP del feature.
- [store](./store/README.md): estado de usuario, bloqueo y errores de login.

Propósito
- Proveer páginas y componentes para login, registro y recuperación de contraseña.
- Ofrecer una `AuthLayout` reutilizable con soporte para imágenes de fondo y panel de formulario.

Estructura principal
```
src/features/auth/
├─ components/
│  ├─ LoginForm.tsx            # Formulario de login (validaciones, remember me, botones sociales)
│  └─ ...                     # Otras primitivas relacionadas
├─ layouts/
│  └─ AuthLayout.tsx          # Layout reutilizable con background + panel derecho
├─ pages/
│  ├─ login/LoginPage.tsx     # Página de login — importa AuthLayout + LoginForm
│  ├─ register/RegisterPage.tsx
│  └─ forgot-password/ForgotPasswordPage.tsx
├─ services/
│  └─ auth service helpers    # llamadas API (login, register, etc.)
└─ README.md                  # (este archivo)
```

Archivos clave

- `AuthLayout.tsx`
  - Props principales:
    - `imageSrc?: string` — URL opcional para la imagen de fondo principal.
    - `eyebrow`, `heading`, `description`, `stats` — contenido del panel izquierdo.
    - `formEyebrow`, `formTitle`, `formSubtitle`, `children`, `footer` — contenido del panel del formulario.
  - Características:
    - Soporta `backgroundImage` usando `imageSrc` o un gradiente por defecto.
    - El panel derecho está centrado y se puede ajustar mediante clases `p-*`, `max-w-*`, etc.

- `LoginForm.tsx`
  - Maneja estado local del formulario (`email`, `password`, `rememberMe`).
  - Usa `useFormValidation` y `zod` para validaciones.
  - Exporta un formulario con `Input`, `Checkbox` y `Button` reutilizables.
  - Claves de personalización:
    - Cambiar el color o tamaño del botón mediante props y clases `className`.
    - Personalizar botones sociales (Google/Apple) en la sección inferior.

- `ForgotPasswordPage.tsx`
  - Nueva página colocada en `src/features/auth/pages/forgot-password/`.
  - Usa `AuthLayout` y un formulario simple que envía el email para recibir enlace.

Rutas
- Definidas en `src/routes/paths.ts`:
  - `PATHS.auth.login = '/auth/login'`
  - `PATHS.auth.register = '/auth/register'`
  - `PATHS.auth.forgotPassword = '/auth/forgot-password'`
- `src/routes/appRouter.tsx` ya registra `ForgotPasswordPage`.
- `MainLayout` detecta rutas `auth` y oculta `Header`, `CentralNav` y `Footer` en esas rutas.

Agregar / usar imágenes de fondo
- Opción `public/`: colocar una imagen en `public/` y pasar su URL mediante `imageSrc`.
- Opción `src/assets/`: importar con alias `@assets` y pasar la variable importada a `AuthLayout`.

Ejemplos
- Login page (usa `AuthLayout`):
```tsx
<AuthLayout
  eyebrow="La experiencia es todo"
  heading="Tu próxima función te está esperando."
  description="Entradas, membresía y beneficios..."
  stats={[{value:'12+',label:'Salas'}, ...]}
  imageSrc="/login.png"
  formEyebrow="Bienvenido de vuelta"
  formTitle="Inicia sesión"
>
  <LoginForm ... />
</AuthLayout>
```

Cómo desarrollar y probar
1. Instala dependencias:
```bash
npm i
```
2. Levanta el servidor:
```bash
npm run dev
# Open http://localhost:5174/auth/login
```
 
