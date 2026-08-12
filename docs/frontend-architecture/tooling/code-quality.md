# Calidad de código (ESLint y Prettier)

## ESLint

Configuración en `eslint.config.js` (flat config): configs `js.recommended`, `typescript-eslint`, `react-hooks`, `react-refresh` + `eslint-config-prettier` al final (desactiva reglas de formato que no le corresponden a ESLint).

## Prettier

Configuración en `.prettierrc.json` (convención del equipo):

| Opción          | Valor   |
| --------------- | ------- |
| `semi`          | `true`  |
| `singleQuote`   | `false` |
| `tabWidth`      | `2`     |
| `trailingComma` | `"es5"` |
| `printWidth`    | `100`   |
| `bracketSpacing`| `true`  |

`.prettierignore`: `node_modules`, `dist`, `docs`, `public`, `package-lock.json`, `.env*`.

> Las comillas de los strings no se conservan mezcladas: Prettier normaliza a **dobles** (el estilo objetivo). ESLint acepta ambas — la normalización ocurre solo al correr `format`.

## Scripts

| Script         | Comando              |
| -------------- | -------------------- |
| `lint`         | `eslint . --ext ts,tsx` |
| `lint:fix`     | ESLint con `--fix`   |
| `format`       | `prettier --write .` |
| `format:check` | `prettier --check .` |

> Las reglas de TypeScript (`strict`, `noUncheckedIndexedAccess`, etc.) se documentan y fijan en la [guía de tipado](../../type-guides/typing-guide.md#2-configuración-base-obligatoria); `npm run lint` y `npm run build` las hacen cumplir. Ver también el [checklist de PR de tipado](../../type-guides/typing-guide.md#11-checklist-de-pr).
