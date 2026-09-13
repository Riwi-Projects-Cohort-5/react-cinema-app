# Layouts de autenticación

En `AuthLayout` concentré la composición visual compartida por las pantallas de acceso: marca, contenido editorial, estadísticas opcionales y formulario.

## `AuthLayout`

Recibe contenido textual (`eyebrow`, `heading`, `description`), estadísticas opcionales y el contenido interactivo mediante `children`. `footer` permite agregar enlaces como registro o retorno al login. `imageSrc` permite configurar el fondo.

Las vistas de login y recuperación ocupan toda la pantalla. En escritorio uso el arte como fondo full-screen y posiciono el formulario en un panel lateral; en mobile mantengo una vista full-screen con el formulario centrado, sin una card exterior que encierre toda la página.

La marca se carga desde `src/assets/logo.svg` y se reutiliza en las variantes desktop y mobile.

La navegación de cierre en mobile usa `navigate(-1)` y la marca enlaza a `PATHS.home`.

## Cómo implementarlo

Una página debe encargarse de su estado y pasar el formulario como hijo:

```tsx
<AuthLayout
  eyebrow="Bienvenido"
  heading="Accede a tu cuenta"
  formEyebrow="Autenticación"
  formTitle="Iniciar sesión"
  formSubtitle="Continúa para ver tus entradas."
  footer={<Link to={PATHS.auth.register}>Crear cuenta</Link>}
>
  <LoginForm onSubmit={handleSubmit} />
</AuthLayout>
``` 