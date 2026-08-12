# Lógica de negocio

## Descripción

La lógica de negocio define el comportamiento funcional de la aplicación y establece cómo interactúan la interfaz de usuario, el estado de la aplicación y los servicios para cumplir con los requisitos del negocio.

Su objetivo es mantener una clara separación de responsabilidades, facilitando el mantenimiento, la reutilización y la escalabilidad del proyecto.

## Principios

- La lógica de negocio debe estar separada de la interfaz de usuario.
- Cada funcionalidad debe ser responsable únicamente de su propio dominio.
- La lógica debe ser reutilizable y fácil de mantener.
- Evitar duplicar lógica entre funcionalidades.
- Mantener un bajo acoplamiento entre módulos.

## Flujo de una funcionalidad

Toda funcionalidad debe seguir un flujo similar al siguiente:

```text
Usuario
   │
   ▼
Interfaz de Usuario
   │
   ▼
Lógica de Negocio
   │
   ▼
Estado (cuando aplique)
   │
   ▼
Servicio
   │
   ▼
Backend
```

La respuesta sigue el mismo recorrido hasta actualizar la interfaz de usuario.

## Responsabilidades

### Interfaz de Usuario

Responsable de:

- Mostrar información.
- Capturar la interacción del usuario.
- Emitir eventos.

No debe contener reglas de negocio complejas ni realizar comunicación directa con el backend.

### Lógica de Negocio

Responsable de:

- Procesar la información.
- Coordinar el flujo de la funcionalidad.
- Aplicar reglas del negocio.
- Preparar los datos antes de enviarlos al backend.

### Estado

Cuando una funcionalidad requiera compartir información entre varios componentes, esta deberá centralizarse en un store. El estado local debe utilizarse únicamente para información propia de un componente. Ver [Gestión del estado](./state-management.md).

### Servicios

Los servicios son responsables de la comunicación con el backend. Toda petición HTTP debe realizarse desde esta capa, pasando por el cliente HTTP centralizado (ver [Cliente HTTP](../data-layer/http-client.md)).

Cada `features/<feature>/services/` expone funciones que mapean uno o más endpoints del contrato de API (ver el [catálogo de endpoints](../../api/README.md) y las [convenciones de capa de datos](../../api/00-conventions.md#12-capa-de-datos-en-frontend-axios--tanstack-query)). El tipado de estas funciones debe declarar su retorno explícitamente (ver [guía de tipado §6](../../type-guides/typing-guide.md#6-tipado-de-la-capa-de-servicios)).

## Reglas generales

- No duplicar lógica de negocio.
- Mantener responsabilidades claramente separadas.
- Evitar dependencias innecesarias entre funcionalidades.
- Reutilizar lógica siempre que sea posible.
- Mantener las funcionalidades independientes entre sí.

## Documentos relacionados

- [Gestión del estado](./state-management.md)
- [Cliente HTTP](../data-layer/http-client.md)
- [Organización por features](../architecture/features.md)
- [Contrato de API](../../api/README.md) y [convenciones compartidas](../../api/00-conventions.md)
- [Guía de tipado (TypeScript)](../../type-guides/typing-guide.md)
