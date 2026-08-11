# Organización por features

## Qué es una feature

Una feature representa una funcionalidad del negocio. Ejemplos: Authentication, Movies, Cart, Checkout, Profile, Membership.

Cada feature debe contener únicamente los recursos relacionados con esa funcionalidad. Su estructura puede organizarse según sus necesidades (ver [Estructura del proyecto](./project-structure.md)).

Las features se corresponden con los módulos del contrato de API: el [catálogo de endpoints](../../api/README.md) agrupa los endpoints por módulo de negocio (`02-movies/`, `05-auth/`, `08-cart/`, ...), y cada feature consume los endpoints de su módulo mediante `features/<feature>/services/`.

## Responsabilidad

Cada feature tiene un responsable asignado. El desarrollador encargado podrá implementar, siempre que los cambios pertenezcan exclusivamente a su funcionalidad:

- Interfaz de usuario.
- Lógica de negocio.
- Gestión del estado.
- Integración con la API (los contratos en [`docs/api/endpoints/`](../../api/endpoints/) son la fuente de verdad).
- Interfaces y tipados (según la [guía de tipado](../../type-guides/typing-guide.md)).
- Pruebas cuando apliquen.

## Independencia

Cada feature debe mantenerse lo más independiente posible. Se debe evitar:

- Compartir lógica innecesariamente.
- Crear dependencias entre funcionalidades.
- Modificar módulos ajenos sin coordinación.

## Recursos compartidos

Los recursos utilizados por varias funcionalidades se ubican en un espacio compartido del proyecto (`src/shared/`):

- Componentes reutilizables.
- Interfaces y tipos de dominio comunes.
- Utilidades compartidas.

## Coordinación

Cuando una modificación afecte varias funcionalidades, deberá coordinarse previamente con los responsables involucrados para evitar conflictos durante la integración.

## Escalabilidad

Toda nueva funcionalidad debe integrarse siguiendo esta organización, respetando las convenciones y la arquitectura definida por el equipo, con el objetivo de mantener una aplicación modular, mantenible y fácil de extender.

## Creación de una feature

```bash
npm run feature <nombre>
```

El script genera el scaffold estandarizado bajo `features/<nombre>/`. Ver la [documentación del script](../../scripts/info.md) para la estructura que crea, [Estructura del proyecto](./project-structure.md) para el contexto en el que se inserta, y la [guía de tipado](../../type-guides/typing-guide.md) para las reglas aplicables a `interfaces/` desde el primer archivo.
