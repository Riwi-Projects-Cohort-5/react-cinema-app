# Layouts de autenticación

En `AuthLayout` concentré la composición visual compartida por las pantallas de acceso: marca, contenido editorial, estadísticas opcionales y formulario.

## `AuthLayout`

Recibe contenido textual (`eyebrow`, `heading`, `description`), estadísticas opcionales y el contenido interactivo mediante `children`. `heading` acepta texto o `ReactNode` para poder controlar saltos de línea en títulos. `footer` permite agregar enlaces como registro o retorno al login. `imageSrc` permite configurar el fondo.

Las vistas de login y recuperación ocupan toda la pantalla. En escritorio divido visualmente la sección en dos mitades: el arte y el contenido editorial quedan a la izquierda, mientras el formulario queda centrado dentro de la mitad derecha. La prop opcional `formCard` activa únicamente para login el contenedor visual con fondo, borde, radio y sombra; recuperación mantiene el formulario flotante sobre el fondo, sin card visible. En mobile la vista sigue ocupando toda la pantalla y la card se aplica solo cuando `formCard` está activo.

Cuando `formCard` está activo, el layout también agrega la línea superior con gradiente y la mantiene posicionada respecto al contenedor `relative` de la card. La marca se carga desde `src/assets/logo.svg` y se reutiliza en las variantes desktop y mobile.

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
  formCard
  footer={<Link to={PATHS.auth.register}>Crear cuenta</Link>}
>
  <LoginForm onSubmit={handleSubmit} />
</AuthLayout>
``` 