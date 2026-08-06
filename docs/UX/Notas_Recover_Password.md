La idea de esta vista es que se vea igual de ordenada y centrada que el login, pero con el texto y el formulario adaptados para recuperar contraseña.

## Qué hace cada cosa

- `useState`: guarda lo que el usuario escribe en el email y en el user. Es como una memoria local del input.
- `handleSubmit`: se ejecuta al mandar el formulario. Aquí se evita recargar la página y luego se imprime en consola lo que el usuario escribió.
- `return (...)`: devuelve el JSX que React dibuja en pantalla.

## Bloques del diseño

- `min-h-screen`: hace que el contenedor ocupe toda la altura de la pantalla.
- `flex`: activa el modo flexible para poder organizar el contenido fácil.
- `relative`: permite posicionar elementos con respecto a su contenedor.
- `overflow-hidden`: evita que algo se salga del contenedor.
- `absolute inset-0 bg-black`: pone un fondo negro que cubre toda la pantalla.
- `relative z-10`: deja el formulario encima del fondo.
- `items-center justify-center`: son las propiedades clave para centrar el formulario en medio de la pantalla.
- `w-full max-w-md`: hace que el formulario tome todo el ancho disponible, pero con un máximo de 400px.
- `bg-transparent`: deja el fondo del formulario transparente.
- `p-10`: añade padding interno para que el contenido no quede pegado.
- `gap-6`: crea separación entre los elementos del formulario.
- `rounded-lg`: redondea las esquinas.

## Inputs

- `type="email"`: indica que ese campo es de correo.
- `type="text"`: sirve para el campo de usuario.
- `name="email"` y `name="user"`: son identificadores del input.
- `value={email}` y `value={user}`: muestran lo que el usuario escribe.
- `onChange={(e) => setEmail(e.target.value)}`: cada vez que escribe, actualiza el estado.
- `autoComplete="off"`: le dice al navegador que no complete automáticamente esos campos.
- `className="..."`: define cómo se ve el input.

## Paleta de colores

- Fondo principal: negro (`bg-black`).
- Fondo de inputs: gris oscuro azulado (`bg-slate-700/70`).
- Texto principal: blanco (`text-white`).
- Botón principal: naranja (`bg-orange-600`).
- Hover del botón: naranja más oscuro (`hover:bg-orange-700`).
- Focus del input: anillo naranja (`focus:ring-orange-500`).


