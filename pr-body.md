# Pull Request - Template

## Tipo de cambio

**(Obligatorio)**

- [ ] Nueva funcionalidad (`feat`)
- [ ] Corrección de errores (`fix`)
- [x] Documentación (`docs`)
- [ ] Refactorización (`refactor`)
- [ ] Configuración / Herramientas (`chore`)
- [ ] Estilos / UI (`style`)
- [ ] Pruebas (`test`)

---

## Resumen

**(Obligatorio)**

<!-- Describe brevemente el objetivo principal del PR -->

Agrega la Guía de Estándares de Tipado en TypeScript (`docs/type-guides/typing-guide.md`):
define `type` vs `interface`, nombrado, ubicación de carpetas (`shared/interfaces/` vs.
`features/<feature>/interfaces/`), tipado de servicios, formularios y props, para que el equipo (6
personas) tenga una referencia única al crear tipos en cualquier feature. También activa `strict` en
`tsconfig.app.json`, que no estaba encendido.

---

## Contexto / Motivación

**(Obligatorio cuando aplique)**

<!-- Relaciona el cambio con una HU, tarea, bug o necesidad técnica -->

El proyecto está en etapa temprana — solo existe la feature `auth`, sin lógica todavía. Es el momento
más barato para fijar el estándar de tipado: antes de que cada persona empiece a declarar su propia
versión de `Movie`, `Seat`, `User`, etc. dentro de su feature. Con 6 personas trabajando en paralelo
sobre features distintas y sin este lineamiento, era cuestión de tiempo tener entidades divergentes
entre módulos (ej. `Movie` con forma distinta en cartelera vs. admin).

---

## Cambios principales

**(Obligatorio)**

- Se crea `docs/type-guides/typing-guide.md` con 11 secciones: propósito, configuración
  base, `type` vs `interface`, referencia rápida de nombrado/ubicación, organización de carpetas,
  tipado de servicios, formularios y validación, props de componentes, utility types, antipatrones
  prohibidos y checklist de PR.
- Se agrega una sección de **"Deuda técnica detectada"** durante la auditoría del código actual
  (queda para convertirse en tasks de Jira, no se corrige en este PR).
- Se activa `strict`, `noImplicitAny` y `noUncheckedIndexedAccess` en `tsconfig.app.json`.
- Se mueve el documento a `docs/type-guides/` (carpeta dedicada para clasificar guías de tipado,
  separada de `docs/frontend-architecture/`) y se corrigen los links relativos internos afectados
  por el cambio de ubicación.

---

## Alcance

**(Obligatorio)**

### Incluye

- Documentación de estándares de tipado (`typing-guide.md`).
- Activación de modo estricto en `tsconfig.app.json`.

### Fuera de alcance

- Corrección del código existente que ya viola el estándar (ej. `import React` sin usar en
  `LoginPage`/`RegisterPage`, que rompe el build con `strict` activo) — queda documentado como deuda
  técnica, no se toca en este PR para no mezclar alcance.
- Enlazar el nuevo documento en `docs/frontend-architecture/README.md` — ese índice lo administra
  quien mantiene esa documentación, no forma parte de este cambio.
- Implementación de las primeras entidades reales en `src/shared/interfaces/` (`Movie`, `Seat`, etc.)
  — la guía define el patrón, no lo puebla todavía.

---

## Archivos / áreas principales modificadas

**(Opcional)**

| Archivo o área | Descripción |
|---|---|
| `docs/type-guides/typing-guide.md` | Guía nueva de estándares de tipado. |
| `tsconfig.app.json` | Se activa `strict`, `noImplicitAny`, `noUncheckedIndexedAccess`. |

---

## Cómo revisar

**(Obligatorio cuando aplique)**

1. Leer `docs/type-guides/typing-guide.md` completo, en especial la sección 4 (tabla de
   nombrado/ubicación) y la sección 5 (checklist para features nuevas).
2. Confirmar que `tsconfig.app.json` refleja los flags esperados.
3. Correr `npm run build` y verificar el error conocido en "Deuda técnica detectada" (no es
   responsabilidad de este PR corregirlo).

---

## Evidencia / Validación

**(Obligatorio cuando aplique)**

- [ ] Build exitoso.
- [ ] Lint exitoso.
- [ ] Pruebas ejecutadas.
- [ ] Flujo funcional validado.
- [x] Documentación revisada.

Notas:

- `npm run build` (`tsc -b`) falla actualmente por `import React` sin usar en
  `src/features/auth/pages/login/LoginPage.tsx` y `.../register/RegisterPage.tsx` — error
  preexistente, expuesto ahora por `strict`/`noUnusedLocals`. Documentado en "Deuda técnica
  detectada" de la guía, no corregido en este PR.

---

## Dependencias o consideraciones

**(Opcional)**

- No hay `zod`/`yup` instalado todavía; la guía (sección 7) fija el patrón `z.infer<>` para cuando se
  agregue la primera dependencia de validación.
- La guía asume la arquitectura feature-based real del repo (`scripts/create-feature.mjs`), no la
  estructura centralizada `src/types/`/`src/services/` que se había planteado inicialmente.

---

## Documentación incluida

**(Opcional)**

| Documento | Descripción |
|---|---|
| `docs/type-guides/typing-guide.md` | Estándares de tipado: `type` vs `interface`, nombrado, carpetas, servicios, formularios, props, utility types, antipatrones y checklist de PR. |

---

## Checklist

**(Obligatorio)**

- [x] El PR tiene un único propósito.
- [ ] El cambio está relacionado con la HU/tarea asignada.
- [x] No incluye cambios fuera de alcance.
- [x] Sigue las convenciones del proyecto.
- [x] La documentación fue actualizada si aplica.
- [x] Se eliminaron archivos innecesarios si aplica.
- [ ] El cambio fue validado antes de solicitar revisión.

---

## Notas adicionales

**(Opcional)**

- Este documento es un punto de partida, no un cierre: se espera que se actualice a medida que
  aparezcan casos reales no cubiertos (nuevas entidades, estado más complejo, integraciones). Si al
  implementar una feature encuentras un caso que la guía no resuelve, se ajusta la guía en vez de
  improvisar una excepción silenciosa.
- El documento también sirve como contexto para asistentes de IA (Claude Code, Copilot, etc.): si se
  les referencia `typing-guide.md` al generar interfaces, servicios o componentes, van a seguir el
  mismo nombrado y ubicación de carpetas que el resto del equipo, en vez de inventar una convención
  distinta por feature.
