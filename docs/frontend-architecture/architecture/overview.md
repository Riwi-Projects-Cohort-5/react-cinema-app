# Arquitectura del frontend

## Descripción

El frontend del proyecto **React Cinema App** adopta una arquitectura modular basada en funcionalidades (_Feature-Based Architecture_).

Cada funcionalidad agrupa los recursos necesarios para su implementación, permitiendo que un desarrollador sea responsable del ciclo completo de una característica, desde la interfaz de usuario hasta su integración con el backend.

Esta organización reduce dependencias entre los integrantes del equipo, facilita el mantenimiento del código y permite que la aplicación crezca de forma escalable.

## Objetivos de la arquitectura

- Organizar el código por funcionalidades en lugar de por capas.
- Reducir el acoplamiento entre módulos.
- Facilitar el trabajo colaborativo.
- Favorecer la reutilización de componentes.
- Permitir el crecimiento progresivo de la aplicación sin afectar funcionalidades existentes.

## Enfoque de desarrollo

Cada funcionalidad se desarrolla de forma independiente. El desarrollador responsable podrá modificar todos los recursos necesarios para completar su funcionalidad, siempre que los cambios no afecten otras áreas del proyecto.

```text
features/
└── auth/
```

Dentro de `features/auth/` se agrupan todos los archivos relacionados con autenticación.

## Principios

La arquitectura del proyecto se basa en los siguientes principios:

- Organización por funcionalidades.
- Separación de responsabilidades.
- Bajo acoplamiento entre módulos.
- Alta cohesión dentro de cada funcionalidad.
- Reutilización de componentes compartidos.
- Escalabilidad.
- Mantenibilidad.

## Evolución de la arquitectura

La estructura del proyecto no es definitiva. A medida que aparezcan nuevas necesidades, podrán incorporarse nuevas carpetas o módulos dentro de cada funcionalidad, manteniendo siempre la independencia entre ellas y respetando las convenciones definidas por el equipo.

La documentación deberá actualizarse conforme la arquitectura evolucione.

## Documentos relacionados

### Dentro de esta sección

- [Estructura del proyecto](./project-structure.md) — árbol de directorios de `src/` y de cada feature.
- [Organización por features](./features.md) — qué es una feature y cómo se gobierna.

### Del proyecto

La arquitectura del frontend se apoya en otras tres guías que definen los contratos con los que trabaja cada feature:

- [**Contrato de API**](../../api/README.md) — catálogo de endpoints y mapa *Historia de usuario → Endpoints*. Define las reglas transversales (autenticación, envelope de error, paginación) que toda feature consume: [00-conventions.md](../../api/00-conventions.md).
- [**Guía de tipado (TypeScript)**](../../type-guides/typing-guide.md) — cómo se traduce ese contrato a tipos (entidades de dominio en `shared/interfaces`, DTOs, formularios con `z.infer`).
- [**Generador de features**](../../scripts/info.md) — scaffold de `features/<nombre>` vía `npm run feature`.
