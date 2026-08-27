# Script de Automatización: Generador de Features

Este script permite automatizar la creación de la estructura de carpetas y archivos base para nuevos módulos de negocio bajo la arquitectura **Feature-First**.

## 🚀 Cómo usarlo

Ejecuta el siguiente comando en la terminal reemplazando `<modulo>/<feature>` por el módulo y la feature que deseas crear:

```bash
npm run feature <modulo>/<feature>
```
Ejemplo:
```bash
npm run feature profiles/auth
```
📁 Lo que genera el script

El script creará automáticamente una nueva carpeta en `src/features/<modulo>/<feature>/` con la siguiente estructura estandarizada:
```tree
src/features/
└── <modulo>/
    └── <feature>/
        ├── components/          # Componentes visuales puros de la feature
        ├── interfaces/          # Tipos y contratos TypeScript específicos
        ├── layouts/             # Estructuras de pantallas y vistas
        ├── pages/               # Páginas contenedoras y de enrutamiento
        ├── services/            # Endpoints y llamadas asíncronas
        └── store/               # Estado local o global de la feature
```
