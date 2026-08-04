# Script de Automatización: Generador de Features

Este script permite automatizar la creación de la estructura de carpetas y archivos base para nuevos módulos de negocio bajo la arquitectura **Feature-First**.

## 🚀 Cómo usarlo

Ejecuta el siguiente comando en la terminal reemplazando `<nombre-del-feature>` por el nombre del módulo que deseas crear:

```bash
npm run feature <nombre-del-feature>
```
Ejemplo:
```bash
npm run feature profiles
```
📁 Lo que genera el script

El script creará automáticamente una nueva carpeta en src/features/<nombre-del-feature>/ con la siguiente estructura estandarizada:
```tree
src/features/<nombre-del-feature>/
├── components/          # Componentes visuales puros del módulo
├── interfaces/          # Tipos y contratos TypeScript específicos
├── layouts/             # Estructuras de pantallas y vistas
├── pages/               # Páginas contenedoras y de enrutamiento
├── services/            # Endpoints y llamadas asíncronas
└── store/               # Estado local o global del módulo
```