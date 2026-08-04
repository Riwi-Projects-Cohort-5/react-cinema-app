# Homepage — React Cinema App

Documentación explicativa de la vista principal de la aplicación (Homepage), su estructura, componentes y cómo funciona internamente.

## Índice

1. [Resumen general](#resumen-general)
2. [Ruta y configuración](#ruta-y-configuración)
3. [Estructura de archivos](#estructura-de-archivos)
4. [Sección 1: Header con video de fondo](#sección-1-header-con-video-de-fondo)
5. [Sección 2: Cartelera de películas](#sección-2-cartelera-de-películas)
6. [Datos de las películas](#datos-de-las-películas)
7. [Estilos y diseño](#estilos-y-diseño)
8. [Estado actual y próximos pasos](#estado-actual-y-próximos-pasos)

---

## Resumen general

La Homepage es la pantalla principal de la aplicación de cine. Al abrir el proyecto se muestra una página con dos bloques bien diferenciados:

- Un **header cinematográfico** con un video de fondo, un título de bienvenida y botones de autenticación.
- Una **cartelera** con las películas disponibles, presentadas en forma de tarjetas en una cuadrícula.

El diseño sigue un tema oscuro (fondo negro) con acentos naranjas para las puntuaciones, y está construido íntegramente con Tailwind CSS.

## Ruta y configuración

La Homepage se renderiza en la ruta raíz (`/`). El enrutador está definido en `src/appRouter.tsx`:

```tsx
export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home/>
  },
  {
    path: "/auth",
    element: 'Renderizar aqui tus rutas de auth'
  }
]);
```

Como se ve, actualmente solo la ruta `/` tiene un componente real (el `Home`). La ruta `/auth` está reservada para futuras páginas de autenticación y por el momento solo muestra texto de ejemplo.

## Estructura de archivos

Los archivos que intervienen en la Homepage son:

| Archivo | Responsabilidad |
| --- | --- |
| `src/appRouter.tsx` | Define las rutas de la aplicación y asocia `/` con `Home`. |
| `src/features/auth/pages/home/Home.tsx` | Componente principal de la página: combina el `Header` y la cartelera. |
| `src/features/auth/components/Header.tsx` | Encabezado con video de fondo, título y botones de Login/Register. |
| `src/features/auth/components/cards.tsx` | Define el tipo `card`, el arreglo `movies` y el componente `Cards`. |
| `src/assets/video3.mp4` | Video de fondo que se reproduce en el encabezado. |

## Sección 1: Header con video de fondo

El componente `Header` (`src/features/auth/components/Header.tsx`) es la primera sección visible de la página. Está formado por:

### Video de fondo
- Se importa el archivo `video3.mp4` desde `src/assets/`.
- El video se reproduce en **bucle** (`loop`), en **mute** (`muted`), con **autoplay** y es compatible con dispositivos móviles (`playsInline`).
- Cubre todo el ancho y alto del encabezado con `object-cover`, de modo que siempre rellena el espacio disponible sin deformarse.

### Capa oscura
- Sobre el video se coloca un `div` con fondo semitransparente (`bg-black/70`).
- Su propósito es oscurecer el video para que el texto y los botones resalten y se lean con claridad.

### Barra superior
- En la esquina superior derecha se muestran dos botones: **Login** y **Register**.
- Ambos tienen un estilo de borde redondeado con borde blanco, y al pasar el cursor (`hover`) invierten los colores (fondo blanco con texto negro).
- Por ahora son solo visuales: todavía no navegan a ninguna página.

### Contenido central
- Título principal: **"Welcome to Cinema"** (en negrita, hasta `text-7xl` en pantallas grandes).
- Subtítulo: *"Here you can see all movies that you imagine."* con un ancho máximo de lectura (`max-w-3xl`).
- Todo el contenido está centrado vertical y horizontalmente gracias a un contenedor flex.

## Sección 2: Cartelera de películas

Justo debajo del header, el componente `Home` renderiza la cartelera:

```tsx
<section className="grid grid-cols-4 gap-5 mt-2">
  {movies.map((movie) => (
    <Cards key={movie.id} {...movie} />
  ))}
</section>
```

### La cuadrícula
- Un encabezado `h1` con el texto **"CARTELERA"**, centrado y en grande.
- Un contenedor con `grid grid-cols-4`, es decir, **4 columnas** en pantallas de escritorio, con un espaciado de 20px entre tarjetas (`gap-5`).
- Se recorre el arreglo `movies` con `.map()` y por cada película se renderiza un componente `Cards`, pasando todas sus propiedades mediante el spread (`...movie`).

### La tarjeta de película
Cada tarjeta (`Cards`) es un `article` con esquinas redondeadas (`rounded-2xl`) y fondo gris oscuro (`bg-zinc-900`). En su interior se muestran:

- **Imagen**: la portada a lo ancho de la tarjeta con `object-cover` y esquinas redondeadas.
- **Puntuación**: una insignia naranja (`bg-orange-700`) posicionada en la esquina superior derecha de la imagen, con el formato `⭐ {score}`.
- **Título y año**: en la cabecera de la tarjeta, el título en grande y a la derecha el año.
- **Datos técnicos**: género (`Gender`), director (`Director`) y duración en minutos (`Duración`).
- **Descripción**: un párrafo breve con la sinopsis de la película.

## Datos de las películas

Los datos provienen del arreglo `movies`, declarado en `src/features/auth/components/cards.tsx`. Cada elemento cumple con la interfaz `card`:

```ts
interface card {
  id: number;
  image: string;
  title: string;
  score: string;
  year: number;
  gender: string;
  director: string;
  duration: number;
  description: string;
}
```

Actualmente hay **8 películas** definidas. Los títulos son de superhéroes (Spiderman, Batman, Superman, etc.) y las imágenes usan `https://picsum.photos/seed/shawshank/400/600`, un servicio de imágenes placeholder que devuelve siempre la misma foto.

> Nota: muchos registros repiten el mismo título y datos (todos los "Superman"). Es un array de ejemplo; en una versión real cada registro tendría su propia película e imagen.

## Estilos y diseño

- Todo el proyecto usa **Tailwind CSS** con clases utilitarias directamente en el JSX.
- La paleta es oscura: fondo negro (`bg-black`) en la página y gris zinc (`bg-zinc-900`) en las tarjetas.
- Los acentos de color son el **naranja** (`bg-orange-700`) para la puntuación y el **blanco** para los textos.
- El layout de tarjetas es responsivo por diseño (`grid` de 4 columnas), aunque por ahora no se definen breakpoints adicionales para pantallas pequeñas.


