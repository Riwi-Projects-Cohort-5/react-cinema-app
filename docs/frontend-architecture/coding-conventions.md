# Coding Conventions

## Descripción

Este documento establece las convenciones de desarrollo utilizadas en el proyecto con el objetivo de mantener un código consistente, legible y fácil de mantener.

Todos los integrantes del equipo deberán seguir estas convenciones durante el desarrollo de nuevas funcionalidades.

---

## Idioma

- El código debe escribirse en inglés.
- Los comentarios y la documentación podrán escribirse en español.

---

## Nomenclatura

### Componentes

Los componentes deben nombrarse utilizando **PascalCase**.

```tsx
MovieCard.tsx;
LoginForm.tsx;
SeatSelector.tsx;
```

---

### Archivos

Los archivos deben utilizar nombres descriptivos.

Ejemplo:

```text
movie-card.ts
movie.service.ts
auth.store.ts
```

Cuando el archivo exporte un componente React, deberá utilizar el mismo nombre del componente.

```text
MovieCard.tsx
```

---

### Variables

Utilizar **camelCase**.

```ts
selectedMovie;
currentUser;
totalPrice;
```

---

### Constantes

Las constantes globales deben utilizar **UPPER_SNAKE_CASE**.

```ts
MAX_SEATS;
API_TIMEOUT;
DEFAULT_LANGUAGE;
```

---

### Interfaces

Las interfaces deben utilizar **PascalCase**.

```ts
interface User {}

interface Movie {}

interface Seat {}
```

---

### Tipos

Los tipos personalizados deben utilizar **PascalCase**.

```ts
type UserRole

type PaymentMethod
```

---

### Hooks

Los hooks personalizados deben comenzar con el prefijo **use**.

```ts
useAuth();

useCart();

useMovies();
```

---

## Imports

Orden recomendado:

1. Librerías externas.
2. Imports internos.
3. Imports relativos.

Ejemplo:

```ts
import { useState } from "react";

import { Button } from "@/components";

import "./styles.css";
```

---

## Exportaciones

Siempre que sea posible, utilizar exportaciones nombradas.

```ts
export function LoginForm() {}
```

Evitar el uso innecesario de `default export`.

---

## Comentarios

Los comentarios deben utilizarse únicamente cuando aporten contexto o expliquen una decisión de implementación.

Evitar comentar código evidente.

---

## Legibilidad

- Utilizar nombres descriptivos.
- Evitar abreviaturas innecesarias.
- Mantener funciones pequeñas.
- Mantener responsabilidades bien definidas.
- Evitar código duplicado.

---

## Consistencia

Todo el código nuevo debe seguir estas convenciones para mantener uniformidad en el proyecto y facilitar el trabajo colaborativo.
