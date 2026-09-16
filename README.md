# React Movie Project

Este proyecto es una base inicial para desarrollar una aplicación en React con Vite y TypeScript.

## Tecnologías incluidas

- React 19
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Vitest + React Testing Library

## Cómo empezar

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el proyecto en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Abre la URL que muestra Vite en el navegador.

## Pruebas

```bash
npm run test         # ejecuta los tests una vez
npm run test:watch   # ejecuta los tests en modo watch
```

Los tests de módulos se colocalizan junto a su código (`*.test.tsx`); la infraestructura de test vive
en `src/test/`. Ver `docs/frontend-architecture/tooling/testing.md`.

## Estructura principal

- src/: contiene la lógica principal de la aplicación.
- src/features/: organiza las funcionalidades por módulos, como auth.
- src/layouts/: app-shells globales (MainLayout, AuthenticatedLayout, AdminLayout).
- src/pages/: páginas de nivel de aplicación (404 y error general).
- src/shared/: componentes y utilidades reutilizables.
- src/assets/: recursos estáticos como imágenes y estilos.

## Recomendación para trabajar

- Coloca cada funcionalidad en su propia carpeta dentro de src/features.
- Usa src/shared para elementos que se reutilicen en varias vistas.
- Los routes principales se manejan desde src/routes/appRouter.tsx.

Esta estructura sirve como punto de partida para construir la aplicación de forma ordenada y escalable.

## Versiones de Node y npm

Este proyecto requiere **Node.js >=22 <23** y **npm >=10**. La versión de Node está fijada en `.nvmrc` y el `package.json` incluye el campo `engines`. El archivo `.npmrc` activa `engine-strict=true`, lo que hace que `npm ci` falle si las versiones no coinciden.

- Usa [`nvm`](https://github.com/nvm-sh/nvm) o [`fnm`](https://github.com/Schniz/fnm) para gestionar la versión de Node: `nvm use` leerá `.nvmrc` automáticamente.
- **Nadie edita `package-lock.json` a mano ni resuelve sus conflictos a mano.** Ante un conflicto en el lockfile, descarta tu versión propia y ejecuta `npm install` de nuevo para regenerarlo.
- El Dockerfile usa `node:22-alpine` y `npm ci` para garantizar que el build en CI sea reproducible.
- El CI ejecuta `npm ci` en la matriz `ubuntu-latest` + `windows-latest` para verificar paridad entre sistemas operativos.
