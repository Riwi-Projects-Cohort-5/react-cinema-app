# Guía de Estándares de Tipado (TypeScript)

> Complementa [`coding-conventions.md`](../frontend-architecture/coding-conventions.md) (nomenclatura general) y
> [`docs/api/00-conventions.md`](../api/00-conventions.md) (contrato de API — dinero, fechas, ids,
> enums, envelopes). Léelos primero si no los conoces: esta guía asume sus reglas y solo define cómo
> se traducen a tipos de TypeScript.

## 1. Propósito y alcance

Esta guía es de uso **obligatorio** para los 6 integrantes del equipo de frontend del proyecto
**Multicine** (React + TypeScript + Vite). Aplica a todo código bajo `src/` que declare o consuma
tipos: entidades de dominio, props de componentes, servicios, formularios y estado.

No cubre testing, CI/CD ni tipado de backend — eso está fuera de alcance de este documento.

Existe porque el proyecto está en una etapa temprana (solo la feature `auth` tiene código, y aún sin
lógica): **es más barato fijar el estándar ahora, con una sola feature, que corregirlo cuando las 6
personas ya hayan definido su propia versión de `Movie`, `Seat` o `User`.**

---

## 2. Configuración base obligatoria

`tsconfig.app.json` debe tener activado el modo estricto completo. Antes de esta guía, el proyecto
**no** tenía `strict` activado — se agregó como parte de esta tarea:

```jsonc
{
  "compilerOptions": {
    // ...
    "strict": true,
    "noUncheckedIndexedAccess": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Reglas derivadas de esta configuración:

- **Ningún PR puede desactivar `strict` ni ninguna de sus sub-opciones** (`strictNullChecks`,
  `noImplicitAny`, etc.), ni localmente en un archivo con un comentario, ni en `tsconfig.app.json`.
- `noUncheckedIndexedAccess` implica que acceder a un arreglo/objeto por índice (`seats[i]`,
  `record[key]`) devuelve `T | undefined`. **No hacer `as T` para silenciarlo** — validar el
  `undefined` o usar `.at()` con verificación.
- `npm run build` (`tsc -b && vite build`) debe compilar sin errores antes de abrir un PR.

---

## 3. `type` vs `interface`

Regla de decisión (no ambas para el mismo caso):

| Caso | Usar | Por qué |
|---|---|---|
| Entidad de dominio (forma de un objeto que puede crecer o extenderse) | `interface` | Permite *declaration merging* y extensión explícita con `extends`, útil para DTOs que heredan campos comunes. |
| Props de un componente | `interface` | Igual razón; además es lo que ya usa el resto del equipo React. |
| Unión de valores (estados, variantes, resultados) | `type` | `interface` no puede expresar una unión. |
| Alias de un tipo primitivo, tupla, o tipo utilitario derivado (`Omit<>`, `Pick<>`) | `type` | Es literalmente un alias, no una forma extensible. |

Ejemplos reales del dominio Multicine (basados en `docs/api/endpoints/02-movies/06-GET-movies.md` y
`docs/api/endpoints/03-functions/14-GET-functions-functionId-seats.md`):

```ts
// Entidad → interface (forma del #6 GET /movies, confirmada en la colección)
interface Movie {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  classification: string;
  duration: number;
  director: string;
  language: string;
  isSubtitled: boolean;
  posterUrl: string;
  trailerUrl: string | null;
  releaseDate: string; // YYYY-MM-DD — convenciones §7
  rating: number;
  isActive: boolean;
}

// Unión de literales → type (sillas del #14, contrato pendiente de confirmación)
type SeatState = "AVAILABLE" | "RESERVED" | "SOLD" | "DISABLED";
type SeatType = "GENERAL" | "PREFERENTIAL" | "VIP" | "DISABLED" | "ACCESSIBLE";
```

No mezclar: si `Movie` ya es `interface`, no crear en otro archivo `type Movie = {...}` con una forma
distinta para "lo que necesito en esta pantalla" — ver §5 y §9 (usar utility types sobre la misma
entidad, no redefinirla).

---

## 4. Referencia rápida: nombrado y ubicación

Consulta esta tabla **antes** de crear un archivo de tipos. Responde a una sola pregunta: *¿qué
estoy creando?* → nombre de archivo, sufijo del tipo/interfaz, y carpeta exacta.

| ¿Qué estoy creando? | Nombre del archivo | Sufijo del tipo | ¿Dónde va? |
|---|---|---|---|
| Entidad de dominio usada en **más de una feature** (`Movie`, `Seat`, `User`, `Cart`...) | `movie.interface.ts` | *(ninguno)* → `Movie` | `src/shared/interfaces/` |
| Tipo/interfaz que solo usa **una feature** (ej. estado interno de un store) | `auth-store.interface.ts` | *(ninguno)* | `features/<feature>/interfaces/` |
| Forma cruda del backend, cuando difiere del modelo de UI | `movie.dto.ts` (junto a `movie.interface.ts`) | `Dto` → `MovieDto` | Misma carpeta que la entidad (`shared/` o local, según §5) |
| Props de un componente | Mismo archivo del componente (`MovieCard.tsx`) | `Props` → `MovieCardProps` | Junto al componente |
| Valores de un formulario | El schema los infiere, ver §7 | `FormValues` → `LoginFormValues` | `features/<feature>/validations/` |
| Envelope de error de API | `api.interface.ts` | `ApiErrorBody` | `src/shared/interfaces/` |
| Unión de estados/variantes de una entidad (`SeatState`, `PaymentMethod`) | Mismo archivo que la entidad relacionada | *(ninguno, es un `type` unión)* | Misma carpeta que la entidad |

**Regla de decisión único-criterio:** ¿el tipo se importa (o se va a importar) desde más de una
feature? Si sí → `src/shared/interfaces/`. Si no → `features/<feature>/interfaces/`. En el momento
en que una segunda feature necesita importar un tipo local, **se mueve** a `shared/interfaces/` ese
mismo día — no se copia ni se re-declara.

**Union types de string vs. `enum`:** usar siempre union de literales, nunca `enum`. Los enums del
contrato se exponen como strings de display (`docs/api/00-conventions.md` §8): `genre: "Accion"`,
`classification: "PG-13"`, `language: "Ingles"`. Un union type copia el literal exacto del contrato
y no genera código JS extra en el bundle:

```ts
// Correcto — copia el literal exacto que envía el backend
type SeatState = "AVAILABLE" | "RESERVED" | "SOLD" | "DISABLED"; // #14, pendiente de confirmación

// Prohibido — enum no coincide 1:1 con el string del backend sin mapeo manual
enum SeatState { Available, Reserved, Sold, Disabled }
```

---

## 5. Organización de carpetas (adaptada a la arquitectura real: feature-based)

El proyecto **no** centraliza todo en `src/types/` — usa arquitectura por funcionalidades
(`docs/frontend-architecture/feature-organization.md`), y `scripts/create-feature.mjs` ya genera una
carpeta `interfaces/` por feature. La regla de §4 respeta esa estructura, con **una sola excepción
obligatoria**: las entidades de dominio usadas por más de una feature no pueden vivir dentro de una
sola feature.

```text
src/
├── shared/
│   └── interfaces/
│       ├── movie.interface.ts       # Movie, MovieDto — usado por Cartelera, Detalle, Admin
│       ├── seat.interface.ts        # Seat, SeatState, SeatType — usado por Funciones, Checkout
│       ├── user.interface.ts        # User, Membership — usado por Auth, Perfil, Admin
│       └── api.interface.ts         # ApiErrorBody
└── features/
    ├── auth/
    │   └── interfaces/
    │       ├── login-form.interface.ts     # LoginFormValues (solo se usa en auth)
    │       └── auth-store.interface.ts     # AuthState (solo se usa en auth)
    └── movies/                             # cualquier feature nueva sigue el mismo patrón
        └── interfaces/
            └── movie-filters.interface.ts  # MovieFiltersState (solo se usa en movies)
```

Un archivo por entidad de dominio dentro de `shared/interfaces/`, re-exportado desde
`shared/interfaces/index.ts` para que el import quede `import type { Movie } from "@/shared/interfaces"`
en vez de apuntar al archivo concreto. **Este patrón es el mismo sin importar la feature** — no hay
reglas especiales para `auth` frente a `movies`, `cart`, `payments`, etc.

### Al crear una feature nueva (`npm run feature <nombre>`)

El scaffold genera `interfaces/`, `services/`, `store/` y `pages/` vacíos para cualquier feature.
Antes de escribir el primer archivo dentro de `interfaces/`, sigue este orden:

1. **Revisa si la entidad que necesitas ya existe en `src/shared/interfaces/`.** Si tu feature
   consume `Movie`, `Seat`, `User`, etc., impórtala de ahí — no la vuelvas a declarar.
2. **Para cada tipo nuevo, ubícalo con la tabla de §4** (¿se usa en más de una feature? → `shared/`;
   ¿solo en la tuya? → `features/<tu-feature>/interfaces/`).
3. **Si más adelante otra feature necesita un tipo que declaraste como local, muévelo a
   `shared/interfaces/` ese mismo día** (regla de §4) — no lo dupliques.
4. Aplica el resto de la guía igual que en cualquier feature existente: servicios con retorno
   explícito (§6), formularios con `z.infer` (§7), props sin `React.FC` (§8).

---

## 6. Tipado de la capa de servicios

Aún no existe ningún archivo en `features/*/services/`, así que esta sección fija el patrón a seguir
desde el primer servicio que se escriba, alineado con `docs/api/00-conventions.md` §4, §5 y §12
(envelope de error `{ "error": "..." }`, listados como arreglo plano, cliente Axios centralizado,
ningún componente hace fetch directo).

- **Toda función de servicio declara su tipo de retorno explícitamente.** Nunca dejar que TypeScript
  lo infiera del `axios.get(...)`.
- **DTO ≠ modelo de UI.** El DTO es la forma cruda del backend (fechas ISO string, montos como
  enteros COP, ids enteros). Si la UI necesita una forma distinta (ej. fecha ya formateada), se mapea
  en el servicio, no en el componente.
- Los endpoints de listado devuelven **arreglos planos** (convenciones §5); no hay envelope de
  paginación que tipar.

```ts
// src/shared/interfaces/api.interface.ts
export interface ApiErrorBody {
  error: string; // mensaje legible en español — convenciones API §4
}

// src/shared/interfaces/movie.interface.ts
export interface Movie {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  classification: string;
  duration: number;
  director: string;
  language: string;
  isSubtitled: boolean;
  posterUrl: string;
  trailerUrl: string | null;
  releaseDate: string; // YYYY-MM-DD — convenciones API §7
  rating: number;
  isActive: boolean;
}

// features/movies/services/movies.service.ts (patrón a seguir, aún no implementado)
import { httpClient } from "@/shared/lib/http-client";
import type { Movie } from "@/shared/interfaces";

export function getMovies(): Promise<Movie[]> {
  return httpClient.get("/movies").then((res) => res.data);
}
```

---

## 7. Formularios y validación

No hay `zod` ni `yup` instalado todavía. Cuando se agregue el primer formulario (ej. login), el tipo
del formulario **se infiere del schema, nunca se declara a mano por separado** — de lo contrario el
schema y el tipo divergen con el tiempo.

```ts
// features/auth/validations/login.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  rememberMe: z.boolean().optional(),
});

// El tipo se deriva, no se re-escribe
export type LoginFormValues = z.infer<typeof loginSchema>;
```

```ts
// Prohibido — el tipo y el schema pueden desincronizarse
interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}
const loginSchema = z.object({ /* ... */ });
```

---

## 8. Props de componentes

`React.FC` está **prohibido**: oculta el tipo real de `children`, complica los genéricos y no aporta
nada que una firma de función normal no dé. El proyecto ya sigue esta regla implícitamente —
`LoginPage` y `RegisterPage` no lo usan — pero al no tener props todavía, no queda registrado como
estándar en ningún lado. Patrón obligatorio:

```tsx
// features/auth/pages/login/LoginPage.tsx — patrón objetivo cuando reciba props
interface LoginPageProps {
  redirectTo?: string;
}

export const LoginPage = ({ redirectTo }: LoginPageProps) => {
  return <div>LoginPage</div>;
};
```

Sin props, un componente no declara una interfaz vacía; se deja sin parámetros:

```tsx
// Correcto, así está hoy en el repo
export const LoginPage = () => {
  return <div>LoginPage</div>;
};
```

---

## 9. Utility types recomendados

Preferir derivar tipos desde la entidad de dominio con utility types de TypeScript antes que
redeclarar una forma parecida a mano (viola la regla de §3 de no duplicar `Movie`).

| Utility type | Caso de uso Multicine |
|---|---|
| `Omit<Movie, "id">` | Payload del formulario de creación de película en el panel admin (HU-FE-020) — el backend genera el `id`. |
| `Partial<Movie>` | Payload de un `PATCH`/`PUT` parcial, ej. edición de un campo en el admin. |
| `Pick<Movie, "id" \| "title" \| "posterUrl">` | Forma reducida para un componente de listado ligero (`MovieListItem`) que no necesita el objeto completo. |
| `Record<SeatState, string>` | Mapa de color/label por estado de silla en la leyenda del mapa de sillas. |

```ts
// Panel admin — crear película (HU-FE-020)
type CreateMoviePayload = Omit<Movie, "id" | "isActive">;

// Leyenda del mapa de sillas (HU-FE-010)
const seatStateLabel: Record<SeatState, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  SOLD: "Vendida",
  DISABLED: "No disponible",
};
```

---

## 10. Antipatrones prohibidos

Basado en lo encontrado en la auditoría de `develop` (no en una lista genérica):

- **Import de `React` sin usar.** Con `jsx: "react-jsx"` no hace falta importar `React` para usar
  JSX. Ya aparece en `LoginPage.tsx` y `RegisterPage.tsx` (ver §"Deuda técnica detectada") y ahora
  que `strict`/`noUnusedLocals` están activos, rompe el build.
- **Carpetas `interfaces/index.ts` vacías usadas como "ya lo resuelvo después".** El generador
  (`scripts/create-feature.mjs`) crea el archivo pero no obliga a nadie a llenarlo con el patrón
  correcto — no asumir que "está vacío" significa "no hay que decidir nada"; aplican las reglas de
  §5 desde el primer tipo que se agregue ahí.
- **Redeclarar una entidad de dominio dentro de una feature** en vez de importarla de
  `shared/interfaces` (riesgo detectado en el diagnóstico: 6 personas, 0 entidades compartidas hoy).
- **`React.FC`** para tipar componentes (ver §8).
- **`any` explícito o implícito** para "avanzar rápido" en un servicio o un handler de evento —
  con `strict` activo esto ahora falla en build, no solo en code review.
- **Duplicar a mano el tipo de un formulario** que ya tiene un schema de Zod/Yup (ver §7).
- **Servicios sin tipo de retorno explícito** (`export function getMovies(params) {...}` sin `:
  Promise<Movie[]>`).

---

## 11. Checklist de PR

Antes de aprobar un Pull Request que toque tipos:

- [ ] `npm run build` compila sin errores (`tsc -b` con `strict` activo).
- [ ] `npm run lint` sin errores ni warnings nuevos.
- [ ] No hay `any` explícito ni implícito, ni `@ts-ignore`/`@ts-expect-error` sin justificar en comentario.
- [ ] Ninguna entidad de dominio (`Movie`, `Seat`, `User`, `Cart`, etc.) fue redeclarada dentro de una
      feature si ya existe en `src/shared/interfaces/`.
- [ ] Los componentes nuevos no usan `React.FC`; las props están tipadas con `interface Xxx Props`.
- [ ] Todo formulario nuevo infiere su tipo con `z.infer<>` (o el equivalente de Yup), no lo redeclara.
- [ ] Toda función nueva en `services/` tiene tipo de retorno explícito.
- [ ] Los imports no usados fueron eliminados (incluido `import React` cuando no se usa).

---

## Deuda técnica detectada

No se corrigió como parte de esta guía — quedan como candidatas a tasks de Jira:

1. **`src/features/auth/pages/login/LoginPage.tsx:1`** y
   **`src/features/auth/pages/register/RegisterPage.tsx:1`** — `import React from 'react'` sin uso.
   Con `strict`/`noUnusedLocals` ya activos (§2), esto **rompe `npm run build`** ahora mismo
   (`error TS6133`). Es el primer fix necesario antes de que cualquiera pueda mergear a `develop`.
2. **`src/features/auth/interfaces/index.ts`, `store/index.ts`, `components/index.ts`,
   `layouts/index.ts`, `pages/index.ts`** y **`src/shared/interfaces/index.ts`,
   `src/shared/components/index.ts`** — archivos vacíos generados por el scaffold. Esto es
   intencional (§5: cada feature nueva arranca así y se llena siguiendo la guía), no un error. El
   único gap real es que, hasta que `auth` (o cualquier otra feature) implemente su primera
   funcionalidad, no hay todavía un ejemplo vivo en el repo que siga la convención de §4/§8 — solo el
   que está en este documento.
3. **No existe `src/shared/interfaces/` con contenido** (la carpeta existe pero está vacía) —
   ninguna entidad de dominio (`Movie`, `Seat`, `User`, etc.) está definida todavía en código; el
   riesgo de §5 (definiciones divergentes por feature) sigue latente hasta que la primera feature que
   necesite una entidad compartida la cree ahí.
4. **No hay `zod`/`yup` en `package.json`** — se necesita agregar la dependencia antes de que el
   primer formulario (`LoginPage`) implemente validación siguiendo §7.
