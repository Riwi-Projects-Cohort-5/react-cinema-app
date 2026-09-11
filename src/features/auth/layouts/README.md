# Layouts de autenticación

`AuthLayout` proporciona la composición visual compartida por las pantallas de acceso: marca, contenido editorial, estadísticas opcionales y panel de formulario.

## `AuthLayout`

Recibe contenido textual (`eyebrow`, `heading`, `description`), estadísticas opcionales y el contenido interactivo mediante `children`. `footer` permite agregar enlaces como registro o retorno al login. `imageSrc` permite configurar el fondo; en móvil se usa una tarjeta apilada y en escritorio una composición de dos paneles.

La navegación de cierre en móvil usa `navigate(-1)` y la marca enlaza a `PATHS.home`.

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