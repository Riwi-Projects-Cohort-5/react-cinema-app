# Auth (colocado)

Esta documentación está colocada en `src/features/auth` y describe la implementación actual del módulo de autenticación: páginas, componentes, layouts, rutas y prácticas comunes para extender o mantener la funcionalidad.

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
    - `rightImageSrc?: string` — imagen flotante a la derecha (pasar `"/login.png"` si está en `public/`).
    - `eyebrow`, `heading`, `description`, `stats` — contenido del panel izquierdo.
    - `formEyebrow`, `formTitle`, `formSubtitle`, `children`, `footer` — contenido del panel del formulario.
  - Características:
    - Soporta `backgroundImage` usando `imageSrc` o un gradiente por defecto.
    - Renderiza `rightImageSrc` como imagen flotante (si se pasa).
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
- Opción `public/`: colocar imagen en `public/login.png` y pasar `rightImageSrc="/login.png"` o dejar que `AuthLayout` use `backgroundImage`.
- Opción `src/assets/`: importar con alias `@assets` y pasar la variable importada a `AuthLayout`.

Ejemplos
- Login page (usa `AuthLayout`):
```tsx
<AuthLayout
  eyebrow="La experiencia es todo"
  heading="Tu próxima función te está esperando."
  description="Entradas, membresía y beneficios..."
  stats={[{value:'12+',label:'Salas'}, ...]}
  rightImageSrc="/login.png"
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

Buenas prácticas y notas
- Mantén la lógica de negocio (llamadas a APIs) en `services/` y deja los componentes UI en `components/`.
- Para diseños y tokens, revisa `docs/design` y las variables CSS en el `theme`.
- Si la página de auth debe esconder el header/footer, `MainLayout` ya lo hace automáticamente.

Tareas recomendadas / TODOs
- Añadir tests para `LoginForm` (render, validación y comportamiento cuando `isSubmitting`).
- Implementar llamadas reales en `ForgotPasswordPage` usando `services/auth`.
- Exportar tipos y prop docs si se desea generar documentación automática (Storybook o TypeDoc).

Contacto
- Si necesitás que centralice más documentación (ej.: explotar props con ejemplos visuales), decímelo y la incluyo.
