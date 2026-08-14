[⬅ Volver al índice](./README.md)

# 07 — Elevación

Sistema de profundidad sutil, pensado principalmente para fondos oscuros, donde las sombras tradicionales son menos perceptibles que en interfaces claras. Se prioriza el uso combinado de sombra + diferencia de luminosidad de superficie sobre sombras muy marcadas.

| Nivel         | Offset (Y) | Blur | Opacidad | Uso recomendado                                                                  |
| ------------- | ---------- | ---- | -------- | -------------------------------------------------------------------------------- |
| **Shadow XS** | 1px        | 2px  | 0.16     | Elementos ligeramente elevados sobre su superficie base (chips, inputs en focus) |
| **Shadow SM** | 2px        | 6px  | 0.20     | Tarjetas en reposo (pósters, listados)                                           |
| **Shadow MD** | 4px        | 12px | 0.24     | Tarjetas en estado hover, dropdowns                                              |
| **Shadow LG** | 8px        | 24px | 0.28     | Popovers, menús contextuales, tooltips extensos                                  |
| **Shadow XL** | 16px       | 40px | 0.32     | Modales, diálogos de confirmación de compra                                      |

## Principio de uso

La elevación debe reflejar jerarquía de interacción real (qué está "más cerca" del usuario en un momento dado), nunca usarse como recurso puramente decorativo. Todas las sombras usan un tono base neutro-frío (derivado de `#000000` a las opacidades indicadas) para mantener coherencia con la temperatura general de la paleta.

En modo Light, las mismas opacidades funcionan sobre `#000000`, pero se recomienda validar visualmente cada nivel ya que las sombras son más perceptibles sobre fondos claros — en caso de sentirse demasiado marcadas, reducir la opacidad un 20-30% relativo por nivel.

---

[⬅ Border radius](./06-border-radius.md) · [Volver al índice](./README.md) · [Siguiente: Bordes ➡](./08-bordes.md)
