# Gestión del estado

## Descripción

La gestión del estado permite compartir información entre diferentes componentes de la aplicación de forma consistente y centralizada.

Su objetivo es evitar duplicidad de información, facilitar la comunicación entre componentes y mejorar el mantenimiento del proyecto.

## Principios

- Utilizar estado local cuando la información pertenezca únicamente a un componente.
- Utilizar estado compartido cuando varios componentes necesiten acceder o modificar la misma información.
- Evitar almacenar información innecesaria en el estado global.
- Mantener el estado lo más simple posible.

## Estado local

Debe utilizarse para información temporal o exclusiva del componente.

Ejemplos:

- Apertura de un modal.
- Valor de un input.
- Estado de carga local.

## Estado compartido

Debe utilizarse cuando la información sea utilizada por múltiples componentes o funcionalidades.

Ejemplos:

- Usuario autenticado.
- Carrito de compras.
- Preferencias del usuario.
- Ubicación seleccionada.

## Organización

Cada funcionalidad podrá administrar su propio estado cuando sea necesario (`features/<feature>/store/`). El estado compartido deberá mantenerse desacoplado de la interfaz de usuario y responder únicamente a las necesidades del negocio.

El estado transversal de sesión (token de acceso, cierre de sesión) vive en `src/services/session.ts`; su API completa y el flujo de renovación se documentan en [Cliente HTTP](../data-layer/http-client.md) y las [Guardas](../navigation/guards.md). El contrato de API exige que el `accessToken` se guarde **en memoria** (nunca en `localStorage`/`sessionStorage`) — ver [convenciones de autenticación](../../api/00-conventions.md#3-autenticación).

## Buenas prácticas

- Evitar estados duplicados.
- Mantener un único origen de verdad para cada dato.
- Actualizar el estado únicamente cuando sea necesario.
- Mantener las responsabilidades claramente definidas.
- Evitar almacenar información derivada cuando pueda calcularse.

## Documentos relacionados

- [Lógica de negocio](./business-logic.md)
- [Cliente HTTP](../data-layer/http-client.md)
- [Convenciones de autenticación](../../api/00-conventions.md#3-autenticación)
