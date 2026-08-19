# React Cinema App — Design System

Documentación oficial de identidad visual y fundamentos de UI (UI Foundations) de **React Cinema App**.

Esta carpeta es la fuente única de verdad sobre estilo visual del proyecto: paleta, tipografía, espaciado, radios, elevación, bordes, opacidad, iconografía y tokens de diseño. Todo el equipo (diseño y desarrollo) debe referenciar estos documentos antes de construir cualquier componente o pantalla.

Ruta: `docs/ui/design-system/`

---

## Índice

| #   | Documento                                    | Contenido                                                                     |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| 01  | [Filosofía del diseño](./01-filosofia.md)    | Objetivo del sistema, personalidad de marca, principios, sensaciones buscadas |
| 02  | [Identidad visual](./02-identidad-visual.md) | Mood, estilo gráfico, inspiración, nivel de minimalismo                       |
| 03  | [Paleta de colores](./03-colores.md)         | Colores base, semánticos y de marca, con hex y justificación                  |
| 04  | [Tipografía](./04-tipografia.md)             | Fuentes y escala tipográfica completa                                         |
| 05  | [Espaciado](./05-espaciado.md)               | Sistema de espaciado base 4px                                                 |
| 06  | [Border radius](./06-border-radius.md)       | Escala de radios                                                              |
| 07  | [Elevación](./07-elevacion.md)               | Sistema de sombras                                                            |
| 08  | [Bordes](./08-bordes.md)                     | Grosores, colores y casos de uso                                              |
| 09  | [Opacidad](./09-opacidad.md)                 | Sistema de opacidades por estado                                              |
| 10  | [Iconografía](./10-iconografia.md)           | Librería de íconos y reglas de uso                                            |
| 11  | [Design Tokens](./11-design-tokens.md)        | Tabla completa de tokens Light/Dark, listos para implementar            
| 12  | [Sistema de Grid](./12-grid.md)               | Columnas, gutter y contenedores por breakpoint                           |
| 13  | [Responsive Foundations](./13-responsive.md)  | Breakpoints oficiales y comportamiento responsive por componente          |
| 14  | [Animaciones](./14-animaciones.md)             | Duraciones, curvas de easing y principios de movimiento                  |
| 15  | [Accesibilidad](./15-accesibilidad.md)         | Reglas WCAG 2.2 AA aplicadas al proyecto                                 |      |

---

## Cómo usar esta documentación

- **Diseño (Figma):** los documentos 03, 04, 05, 06 y 07 son la base directa para crear los Color Styles, Text Styles, Effect Styles y Variables en Figma.
- **Desarrollo (código):** el documento 11 (Design Tokens) es el que se traduce directamente a variables CSS o al archivo de configuración de Tailwind/theme del proyecto.
- **Cualquier duda de "qué valor uso aquí":** siempre se resuelve consultando estos documentos, nunca inventando un valor nuevo. Si un caso no está cubierto, se documenta y se agrega aquí antes de usarse en producción.

## Resumen rápido de identidad

**Concepto:** _Obsidian Indigo_ — cine nocturno de autor con alma de producto tecnológico. Interfaz oscura, minimalista, elegante y tecnológica (estilo Linear/Stripe/Notion), evitando por completo el rojo/amarillo/negro-rojo tradicional del cine.

- **Primario:** Índigo eléctrico `#5B5FEF`
- **Acento:** Cian-menta `#2CE0C1`
- **Tipografía principal:** Space Grotesk
- **Tipografía secundaria:** General Sans
- **Base de espaciado:** 4px
