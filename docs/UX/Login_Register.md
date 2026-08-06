# Documentación - Vistas de Login y Register 

Este documento explica el código de las dos vistas de autenticación que desarrollé para el proyecto `LoginPage.tsx` y `RegisterPage.tsx`. Ambas cubren únicamente la parte visual (UI), sin lógica de conexión al backend todavía.

## 1. LoginPage.tsx

### Imports

```tsx
import { useState } from "react"
```
- `useState`, este componente maneja estado local simple (los valores de los inputs y si la contraseña se muestra o no). 

### Estados (useState)

| Estado | Tipo | Para qué sirve |
| `email` | `string` | Guarda lo que el usuario escribe en el campo de correo |
| `password` | `string` | Guarda lo que el usuario escribe en el campo de contraseña |
| `showPassword` | `boolean` | Controla si la contraseña se muestra en texto plano o se oculta con puntos |
 

### Función handleSubmit

```tsx
const handleSubmit = (event: any) => {
    event.preventDefault()
    console.log({ email, password })
}
```

- `event.preventDefault()` evita que el formulario recargue la página al enviarse.
- Por ahora solo hago un `console.log` con los datos, ya que la conexión real al endpoint `POST /auth/login` no es parte de esta entrega (solo interfaz).

### Etiquetas y estructura visual

- **Contenedor principal (`<div>` con `bg-black` absoluto):** fondo negro sólido que cubre toda la pantalla (tengo pensado implementarle más cositas)
- **`<form>`:** agrupa todos los campos y maneja el evento `onSubmit`.
- **Inputs de Email y Password:** son cajas  con bordes redondeados, iguales en estilo a los de Register
- **Botón de mostrar/ocultar contraseña:** es un `<button type="button">` (no dispara el submit del form) que cambia el `type` del input entre `"text"` y `"password"`, y alterna el ícono SVG entre "ojo abierto" y "ojo tachado".
- **Checkbox "Remember me":** checkbox simple con `accent-orange-500` para que el color del check coincida con la paleta naranja del resto del formulario.
- **Enlace "Sign up":** por ahora es solo un `<span>` con estilo de link; cuando se conecten las rutas, se convertirá en un `<Link>` de React Router.


## 2. RegisterPage.tsx

### Imports

```tsx
import { useState } from "react"
```

- Igual que en Login, solo uso `useState`.

### Estados (useState)

Divido los estados según las 4 secciones que pide la historia de usuario:

**Personal Information:**
- `firstName`, `lastName`: nombre y apellido.
- `docType`: tipo de documento (select).
- `docNumber`: número de documento.
- `birthDate`: fecha de nacimiento (input tipo `date`).
- `gender`: género, opcional (select).

**Contact:**
- `email`, `confirmEmail`: correo y su confirmación.
- `phone`: número de celular.

**Security:**
- `password`, `confirmPassword`: contraseña y su confirmación.
- `showPassword`: controla el ícono de mostrar/ocultar, igual que en Login.

**Preferences:**
- `city`: ciudad principal (select).
- `favoriteComplex`: complejo favorito, opcional (select).

### Función handleSubmit

```tsx
const handleSubmit = (event: any) => {
    event.preventDefault()
    console.log({ firstName, lastName, docType, docNumber, birthDate, gender, email, confirmEmail, phone, password, confirmPassword, city, favoriteComplex })
}
```

- Mismo patrón que en Login: previene el recargo de página y muestra todos los datos en consola, a la espera de conectar el endpoint real `POST /auth/register`.

### Constante inputStyle

```tsx
const inputStyle = "bg-slate-700/70 text-white h-12 px-4 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
```

- Decidí crear esta constante para no repetir la misma cadena de clases de Tailwind en cada input y select del formulario. Así, si en algún momento quiero cambiar el color del borde de foco o el fondo de los campos, solo lo edito en un lugar y se aplica a todo el formulario.
- El `focus:ring-2 focus:ring-orange-500` es lo que hace que el borde se ponga naranja cuando el usuario hace clic en un campo (mismo comportamiento que en Login).

### Etiquetas y estructura visual

- **Secciones tituladas (`<h2>` en naranja, mayúsculas):** divido el formulario en "Personal Information", "Contact", "Security" y "Preferences".
- **Fila de First Name / Last Name:** usa `flex gap-3` con `flex-1` en cada input para que ambos ocupen el mismo ancho, uno al lado del otro.
- **Document Type + Document Number:** select y input en la misma fila, mismo patrón que el anterior.
- **Date of Birth + Gender:** ambos con su propio `<label>` arriba, ya que un placeholder no es suficiente para un campo de fecha o un select.
- **Password con toggle de mostrar/ocultar:** mismo mecanismo que en Login (SVG de ojo abierto/tachado dentro de un `<button type="button">` posicionado con `absolute`).
- **Botón "Continue":** mismo color naranja sólido que el botón "Login" (`bg-orange-600 hover:bg-orange-700`).
- **Enlace "Already have an account? Sign in":** mismo patrón que el "Sign up" de Login, pendiente de convertir en ruta real más adelante.
