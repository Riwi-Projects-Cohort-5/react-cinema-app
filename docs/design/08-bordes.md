[⬅ Volver al índice](./README.md)

# 08 — Bordes

| Propiedad             | Especificación                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Grosor estándar**   | 1px, para la gran mayoría de componentes (inputs, cards, botones outline)                                                                             |
| **Grosor de énfasis** | 1.5px, reservado para estados de foco o selección activa                                                                                              |
| **Color base**        | Token `Border` (ver [03 — Paleta de colores](./03-colores.md)) para contornos neutros                                                                 |
| **Color de énfasis**  | Token `Primary` para bordes en estado activo/focus/seleccionado                                                                                       |
| **Color de error**    | Token `Error` para bordes de validación fallida                                                                                                       |
| **Opacidad**          | Los bordes neutros se usan siempre al 100% de opacidad de su token; no se reduce opacidad, para evitar inconsistencias de contraste entre superficies |

## Casos de uso

- Separación de contenedores sobre fondos del mismo tono de superficie (donde la sombra no es suficiente).
- Delimitación de campos interactivos (inputs, selects).
- Indicación de estado (focus, error, selección) mediante cambio de color de borde, siempre combinado con otro indicador — nunca el color del borde como único indicador de estado (ver 

---
