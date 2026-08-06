# Documentación de Features — Guía estándar

> Este documento es la **guía normativa** sobre **cómo** documentar las features de la plataforma.
> Define plantillas, reglas y buenas prácticas. **No documenta ninguna feature concreta**: las docs
> de cada feature viven en su propio directorio (`docs/features/<feature>/`). Lee primero este
> documento si vas a crear o actualizar documentación de una feature.

## 1. Propósito y alcance

- **Qué es**: el estándar para escribir la documentación de cada feature (qué secciones obligatorias
  tiene un `README.md` de feature, qué reglas seguir y qué se considera buena práctica).
- **Qué NO es**: no reemplaza a los contratos de API ni a la arquitectura transversal. Tampoco es el
  lugar para documentar el trabajo en progreso de una feature puntual.

### Dónde vive cada tipo de documentación

| Contenido | Ubicación | Fuente normativa |
|---|---|---|
| Guía de cómo documentar features | `docs/features/README.md` | Este documento |
| Docs de una feature concreta | `docs/features/<feature>/` | Plantilla en §3 |
| Contratos de endpoints (request/response, errores, paginación) | `docs/api/endpoints/` | [`docs/api/00-conventions.md`](../api/00-conventions.md) |
| Arquitectura transversal, convenciones de código, workflow | `docs/frontend-architecture/` | [`feature-organization.md`](../frontend-architecture/feature-organization.md) |

> Regla de oro: **no dupliques contenido**. Si un dato ya tiene una fuente normativa (p. ej. el
> envelope de error o el patrón de organización de features), enlázalo desde la doc de tu feature en
> vez de copiarlo.

## 2. Estructura de documentación por feature

Cada feature se documenta en su propio directorio, usando el mismo nombre de la feature (`kebab-case`):

```text
docs/features/
├── README.md            # esta guía + índice de features documentadas (ver §4)
└── <feature>/           # ej. cart, checkout, profile, movies
    ├── README.md        # índice de la feature — SIEMPRE obligatorio (plantilla §3)
    └── <tema>.md        # sub-temas opcionales (flujos, decisiones, integraciones…)
```

- Todo directorio de feature **debe** tener un `README.md` que use la plantilla de §3.
- Los sub-temas son opcionales. Se crean cuando el `README.md` supera ~200 líneas o un tema es
  lo bastante autónomo para consultarse por separado.
- Lo que **no** va dentro de `docs/features/<feature>/`:

| Contenido | Va en |
|---|---|
| Endpoint(s) de la feature | `docs/api/endpoints/` (referenciar el nº del catálogo) |
| Reglas compartidas (auth, errores, paginación) | `docs/api/00-conventions.md` |
| Patrón de organización / arquitectura | `docs/frontend-architecture/` |
| Decisiones de infraestructura transversal | `docs/frontend-architecture/architecture.md` |

## 3. Plantilla — `README.md` de una feature

Copia este esqueleto. Las secciones en negrita son obligatorias; ajusta el resto al tamaño real de la
feature (no llenes secciones vacías solo por completar).

```markdown
# Feature <Nombre de la feature>

> Descripción en una o dos líneas: qué resuelve esta feature para el usuario.

## Contexto

Por qué existe esta feature, a qué historia de usuario (HU-FE-XXX) pertenece y qué problema de
negocio atiende.

## Objetivo

El objetivo **único** de la feature, en una frase, orientado al resultado de negocio.

## Alcance

### Incluido

- Lista de capacidades/flujos que cubre la feature.

### Excluido

- Lista explícita de lo que NO cubre (otras features, fases futuras, admin, etc.).

## Dependencias

- Features o módulos de los que depende (con link si ya están documentados).
- Endpoints consumidos (nº del catálogo en `docs/api/README.md`).
- Servicios/estado compartido utilizados.

## Documentos relacionados

- [Contratos de API](...)
- [Arquitectura / convenciones](...)
- [Estado de la feature / deuda técnica pendiente](...)
```

## 4. Reglas obligatorias

1. **Idioma**: toda la documentación se escribe en español.
2. **Un directorio por feature** en `docs/features/<feature>/`, con nombre en `kebab-case`.
3. **Toda feature documentada debe tener un `README.md`** usando la plantilla de §3.
4. **Índice global al día**: cada feature documentada se registra en la tabla de la sección
   [Índice de features](#índice-de-features) de este README, con su link.
5. **No duplicar**: enlazar (con ruta relativa) las fuentes normativas existentes en lugar de copiar
   su contenido (errores, autenticación, organización de features).
6. **Sin valores hardcodeados en la doc**: colores, tokens, URLs y montos se referencian desde su
   fuente de verdad (convenciones de API, configuración, tokens) — nunca se inventan en la doc.
7. **Rutas relativas**: los enlaces entre archivos de `docs/` usan rutas relativas al archivo actual
   (verificar que no queden enlaces rotos antes del PR).
8. **Sincronía con el código**: la documentación de una feature se entrega en la misma PR/branch que
   su implementación, reflejando el código tal y como queda en esa PR (sin adelantarse ni quedarse
   atrás).

## 5. Buenas prácticas

- **Documentar incremental**: escribir la doc junto con el código, no al cierre de la feature.
- **Escribir para quien retoma el trabajo semanas después**: asumir que el lector no recuerda el
  contexto de la feature.
- **Preferir tablas y ejemplos concretos** sobre prosa extensa.
- **Definir el "Excluido" desde el día uno**: evita que la doc de una feature absorba temas ajenos.
- **Anotar deuda técnica**: pendientes, atajos y decisiones provisionales quedan registrados en la
  sección "Documentos relacionados" o como sub-tema, para que el lector sepa qué está estable y qué
  no.
- **Actualizar el índice global** cuando una feature nueva se documente o cambie de nombre.

## 6. Checklist de revisión (PRs de documentación)

- [ ] ¿Está en español y con el estilo de los demás docs del repo?
- [ ] ¿El `README.md` de la feature sigue la plantilla de §3 y define sus **Exclusiones**?
- [ ] ¿La feature está registrada en el [Índice de features](#índice-de-features)?
- [ ] ¿Enlaza las convenciones compartidas (`docs/api/00-conventions.md`,
      `docs/frontend-architecture/feature-organization.md`) sin duplicarlas?
- [ ] ¿Los enlaces entre archivos de `docs/` son rutas relativas válidas (sin enlaces rotos)?
- [ ] ¿No hay valores hardcodeados (tokens, URLs, montos) fuera de su fuente de verdad?
- [ ] ¿El contenido refleja el código actual de la PR (sin drift ni adelantos)?
- [ ] ¿El scope ("Incluido"/"Excluido") es explícito?

## Índice de features

| Feature | Ubicación | Estado |
|---|---|---|
| *(vacío — agrega aquí cada feature documentada)* | | |

---

*Fuentes relacionadas: [`docs/api/README.md`](../api/README.md), [`docs/api/00-conventions.md`](../api/00-conventions.md), [`docs/frontend-architecture/README.md`](../frontend-architecture/README.md).*
