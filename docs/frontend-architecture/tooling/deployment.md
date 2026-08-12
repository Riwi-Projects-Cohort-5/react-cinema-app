# Despliegue (Docker)

## Descripción

El frontend se despliega como una imagen Docker en dos etapas. La imagen build compila el bundle de Vite; la imagen de servicio usa nginx para servir la SPA.

## Imagen

1. **build** — `node:22-alpine`, `npm ci` + `npm run build`. `VITE_API_BASE_URL` se inyecta como build arg (build time).
2. **serve** — `nginx:1.27-alpine` sirve `/app/dist` con `nginx.conf`:
   - Fallback SPA (`try_files $uri $uri/ /index.html`) para las rutas de React Router.
   - Cache `public, immutable` (1 año) para `location /assets/` (assets hasheados).
   - Gzip para text/css/js/json/svg.

`.dockerignore` excluye `node_modules`, `dist`, `docs`, `.git` y `.env*`.

## Comandos

```bash
# Construir y levantar (puerto 8080 por defecto)
docker compose up --build

# O manual, con la URL de la API como build arg
docker build --build-arg VITE_API_BASE_URL=https://api.multicine.com/api/v1 -t multicine-frontend .
docker run -p 8080:80 multicine-frontend
```

> `VITE_API_BASE_URL` es **build time**: Vite la reemplaza en el bundle al compilar. Para otra URL:
> `docker compose build --build-arg VITE_API_BASE_URL=...` o una variable `VITE_API_BASE_URL` en el
> `.env` local.
>
> La URL inyectada corresponde a la [URL base versionada del contrato de API](../../api/00-conventions.md#1-url-base-y-versionado); el fallback SPA de nginx (`/index.html`) es lo que permite servir las rutas de React Router definidas en [Routing](../navigation/routing.md).

## Documentos relacionados

- [Variables de entorno](./environment.md)
- [Índice de la documentación](../README.md)
