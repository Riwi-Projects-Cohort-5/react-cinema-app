[⬅ Volver al índice](./README.md)

# 09 — Opacidad

Sistema de opacidades consistente para estados y efectos, expresado como porcentaje sobre el color base correspondiente.

| Token              | Valor      | Uso recomendado                                                                                                                  |
| ------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `opacity-hover`    | 8%         | Overlay sutil al pasar el cursor sobre elementos interactivos                                                                    |
| `opacity-active`   | 12%        | Overlay al presionar/activar un elemento                                                                                         |
| `opacity-disabled` | 40%        | Reducción de opacidad general para elementos deshabilitados                                                                      |
| `opacity-overlay`  | 64%        | Fondos oscuros detrás de modales y drawers, sobre el token `Background`                                                          |
| `opacity-scrim`    | 72%        | Overlay sobre imágenes (pósters, backdrops) para garantizar legibilidad de texto superpuesto                                     |
| `opacity-glass`    | 40% + blur | Efecto "glass" puntual en barras de navegación flotantes o overlays premium, combinando `Surface` al 40% con desenfoque de fondo |

## Principio general

La opacidad se usa para comunicar estado o jerarquía temporal (hover, disabled, overlay), nunca como sustituto de un color semántico definido en [03 — Paleta de colores](./03-colores.md).

---
