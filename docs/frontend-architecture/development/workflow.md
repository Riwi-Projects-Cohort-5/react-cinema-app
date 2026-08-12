# Flujo de trabajo

## Descripción

Este documento describe el flujo de trabajo que debe seguir cada integrante del equipo para desarrollar una nueva funcionalidad, desde la asignación de una Historia de Usuario (HU) hasta la integración del código en la rama principal del proyecto.

## Flujo de desarrollo

```text
Historia de Usuario
        │
        ▼
Actualizar develop
        │
        ▼
Crear rama
        │
        ▼
Implementar la funcionalidad
        │
        ▼
Pruebas locales
        │
        ▼
Commit
        │
        ▼
Push
        │
        ▼
Pull Request
        │
        ▼
Code Review
        │
        ▼
Merge
```

## 1. Actualizar la rama principal

Antes de comenzar una nueva funcionalidad, sincronizar la rama `develop`.

```bash
git checkout develop
git pull origin develop
```

## 2. Crear una rama

Crear una nueva rama siguiendo la convención del equipo:

```text
Username/Prefix/Code-title
```

Ejemplo:

```text
JorgeCb12/feature/HU-FE-007/login
```

## 3. Desarrollo

Implementar la funcionalidad respetando:

- Arquitectura del proyecto.
- Convenciones de código.
- Buenas prácticas.
- Alcance de la Historia de Usuario.

> Durante la implementación, cada HU se resuelve contra los documentos de referencia del proyecto:
> el [catálogo de API](../../api/README.md) (mapa *Historia de usuario → Endpoints* + contrato de cada
> endpoint), la [guía de tipado](../../type-guides/typing-guide.md) y el
> [generador de features](../../scripts/info.md) para el scaffold. Si la HU crea una feature nueva,
> arrancar con `npm run feature <nombre>`.

## 4. Validación

Antes de realizar el Push, verificar que:

- La aplicación compile correctamente.
- No existan errores de lint.
- La funcionalidad opere correctamente.
- No se afecten otras funcionalidades.

## 5. Commit

Realizar commits claros y descriptivos.

```text
feat: implement login form

fix: validate empty inputs

docs: add frontend architecture
```

## 6. Push

```bash
git push origin nombre-de-la-rama
```

## 7. Pull Request

Abrir un Pull Request hacia la rama correspondiente. Debe incluir:

- Descripción de los cambios.
- Evidencias cuando apliquen.
- Relación con la Historia de Usuario.

## 8. Code Review

Todo Pull Request deberá ser revisado por al menos otro integrante del equipo. El autor del Pull Request no podrá aprobar sus propios cambios.

## 9. Merge

Una vez aprobado el Pull Request y resueltas las observaciones, la funcionalidad podrá integrarse a la rama correspondiente.

## Documentos de referencia

- [Catálogo de API](../../api/README.md) — mapa *Historia de usuario → Endpoints*.
- [Convenciones de API](../../api/00-conventions.md) — reglas transversales del contrato.
- [Guía de tipado (TypeScript)](../../type-guides/typing-guide.md) — incluye checklist de PR.
- [Generador de features](../../scripts/info.md) — scaffold de nuevas features.
