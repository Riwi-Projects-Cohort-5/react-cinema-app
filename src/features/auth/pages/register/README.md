# Registro de usuario

## Propósito

La feature de registro permite crear una cuenta de usuario en la plataforma de cine para habilitar acciones de compra y gestión personal. Su objetivo principal no es bloquear el contenido público, sino preparar al usuario para completar transacciones como reservar entradas, comprar combos, consultar historial o gestionar preferencias.

En este proyecto, la pantalla de registro está pensada para ser una ruta accesible sin autenticación, porque el usuario puede navegar la cartelera, explorar películas y consultar contenido general sin necesidad de ser miembro.

---

## Arquitectura general

La feature sigue una estructura orientada a dominio y separación de responsabilidades:

```text
src/features/auth/pages/register/
├── components/
│   ├── RegisterWizard.tsx
│   ├── RegisterPersonalStep.tsx
│   ├── RegisterContactStep.tsx
│   ├── RegisterSecurityStep.tsx
│   └── RegisterPreferencesStep.tsx
├── interfaces/
│   └── Register.interfaces.ts
├── layouts/
│   └── RegisterLayout.tsx
├── pages/
│   └── RegisterPage.tsx
├── services/
│   └── Register.services.ts
└── README.md
```

### 1. `pages/RegisterPage.tsx`

Es el punto de entrada de la feature. Aquí se define:

- El flujo de pasos del wizard.
- El estado del formulario.
- La validación por paso.
- La lógica de navegación entre pasos.
- El envío final del registro al backend.

El componente centraliza la lógica de negocio del formulario. Mantiene el estado del paso actual, los errores, el estado de carga y el mensaje de error general.

### 2. `components/RegisterWizard.tsx`

Es el orquestador visual. Recibe el estado del formulario y presenta el paso actual. Tiene responsabilidades de:

- renderizar el paso actual,
- mostrar la barra de progreso,
- manejar el avance y retroceso,
- mostrar mensajes de validación,
- mostrar el botón de acción final.

### 3. `components/*Step.tsx`

Cada paso representa una sección del formulario:

- `RegisterPersonalStep`: nombre, apellido, fecha de nacimiento, género.
- `RegisterContactStep`: correo y teléfono.
- `RegisterSecurityStep`: contraseña y confirmación.
- `RegisterPreferencesStep`: ciudad, consentimientos y políticas.

Cada uno se encarga de la UI del campo correspondiente pero no de la lógica de negocio completa.

### 4. `interfaces/Register.interfaces.ts`

Define los modelos del formulario y la estructura del payload que se envía al backend. Esto ayuda a mantener la tipificación fuerte del flujo de registro.

### 5. `services/Register.services.ts`

Se encarga de la comunicación con la API de autenticación. Aquí se realiza el `fetch` a:

```ts
https://api.multicine.com/api/v1/auth/register
```

El servicio:

- prepara el payload con la estructura esperada,
- manda una petición `POST`,
- interpreta la respuesta del backend,
- lanza un error si la solicitud falla.

---

## Flujo de registro

El flujo principal es el siguiente:

1. El usuario entra a `/auth/register`.
2. El componente `RegisterPage` inicializa un formulario vacío.
3. El usuario avanza por los pasos del wizard.
4. En cada paso se valida el contenido del formulario.
5. Si hay errores, se muestran y no permite continuar.
6. Cuando llega al último paso, se construye el payload final.
7. `registerUser(...)` envía los datos al backend.
8. Si el registro fue exitoso, la app puede continuar a otras pantallas o mostrar feedback.

```text
RegisterPage
  -> validateStep(form, currentStep)
  -> RegisterWizard
  -> Step components
  -> registerUser(payload)
  -> API /auth/register
```

---

## Validación del formulario

La lógica de validación está en `RegisterPage.tsx` y se ejecuta por paso.

### Validaciones principales

- Nombre y apellido: solo letras y espacios, mínimo 2 caracteres.
- Edad: se exige ser mayor de 18 años.
- Correo: formato de email válido.
- Teléfono: 10 dígitos.
- Contraseña: mínimo 8 caracteres, incluir letras y números.
- Confirmación de contraseña: debe coincidir.
- Consentimientos: los campos legales deben ser aceptados.

Esto evita que el usuario avance sin completar datos mínimos y ayuda a garantizar la calidad de la información enviada a la API.

---

## ¿Por qué esta URL es pública?

La ruta de registro está dentro del componente `PublicOnlyRoute` en el archivo de enrutamiento principal:

```tsx
{
  element: <PublicOnlyRoute />,
  children: [
    { path: PATHS.auth.login, element: <LoginPage /> },
    { path: PATHS.auth.register, element: <RegisterPage /> },
  ],
}
```

Esto significa que:

- si el usuario no tiene sesión activa, puede entrar a esta ruta,
- si ya está autenticado, será redirigido a la home,
- la pantalla de registro es una ruta de acceso público, no restringida.

### Razón de negocio

El usuario no necesita estar registrado para ver la cartelera de películas, porque la navegación de contenido general es pública y accesible antes del proceso de compra.

El flujo esperado es:

1. El visitante explora la cartelera.
2. Revisa horarios, funciones o detalles de la película.
3. Cuando quiere comprar, debe identificarse o crear una cuenta.
4. La compra, historial y checkout quedan protegidos por `ProtectedRoute`.

Por eso, la ruta de registro no se bloquea con autenticación, pero las acciones sensibles sí:

- perfil,
- historial de compras,
- checkout,
- administración.

Esto se ve claramente en el router:

```tsx
{
  element: <ProtectedRoute />,
  children: [
    { path: PATHS.profile, element: <PlaceholderPage title="Profile" /> },
    { path: PATHS.purchaseHistory, element: <PlaceholderPage title="Purchase History" /> },
    { path: PATHS.checkout, element: <PlaceholderPage title="Checkout" /> },
  ],
}
```

En resumen: la cartelera es pública, pero la compra requiere autenticación.

---

## Relación con la autenticación

La app usa guardas de rutas para decidir qué pantallas están disponibles según si el usuario tiene o no sesión activa.

### `PublicOnlyRoute`

Si ya hay token de sesión, redirige al home.

### `ProtectedRoute`

Si no hay acceso, redirige al login.

Esto es una buena práctica para separar:

- páginas públicas: home, login, registro, cartelera,
- páginas privadas: perfil, compra, historial, panel admin.

---

## Consideraciones de negocio y UX

La feature está diseñada para un flujo clásico de cine:

- sin autenticación, el usuario puede explorar contenido,
- con registro, el usuario puede darse de alta,
- con sesión activa, puede reservar y pagar.

Esto mejora la conversión porque reduce fricción para el visitante y solo obliga a autenticar cuando la acción implica un compromiso real, como comprar una entrada o completar una transacción.

---

## Observaciones importantes

Actualmente, la feature incluye datos demo y placeholders temporales, como:

- `documentNumber` fijo,
- `cityId` predeterminado,
- `favoriteCinemaId` predeterminado,
- `captchaToken` demo.

Esto indica que la integración con el backend aún puede estar en fase de prototipo o validación. En un entorno real, estos valores deberían venir del backend o de la lógica de negocio según el caso.

---

## Conclusión

La feature de registro es una pieza clave dentro del flujo de autenticación de la aplicación. Está diseñada como una ruta pública para facilitar el acceso inicial al catálogo y reducir fricción para los usuarios, pero mantiene la seguridad y la lógica comercial en rutas protegidas cuando se trata de comprar.

La arquitectura está bien separada por capas, con una atención clara a:

- validación del formulario,
- componentes visuales por paso,
- formularios tipados,
- comunicación con la API,
- protección de rutas según la sesión.

Esto hace que la feature sea mantenible, testeable y alineada con la lógica del negocio del cine.
