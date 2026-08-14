[⬅ Volver al índice](./README.md)

# 05 — Sistema de Espaciado

## Unidad base

**4px**, con escala progresiva basada en múltiplos que garantiza consistencia matemática en todo el sistema.

## Escala de espaciado

| Token      | Valor | Uso recomendado                                                                   |
| ---------- | ----- | --------------------------------------------------------------------------------- |
| `space-1`  | 4px   | Separación mínima (ícono + texto, elementos muy compactos)                        |
| `space-2`  | 8px   | Padding interno reducido, separación entre elementos relacionados                 |
| `space-3`  | 12px  | Padding estándar en componentes pequeños                                          |
| `space-4`  | 16px  | Padding base de tarjetas y contenedores; separación entre elementos de formulario |
| `space-5`  | 24px  | Separación entre bloques dentro de una sección                                    |
| `space-6`  | 32px  | Padding de secciones medianas                                                     |
| `space-7`  | 48px  | Separación entre secciones principales                                            |
| `space-8`  | 64px  | Márgenes de sección en desktop                                                    |
| `space-9`  | 96px  | Separación entre grandes bloques editoriales (hero, secciones de landing)         |
| `space-10` | 128px | Márgenes superiores/inferiores de página en layouts amplios                       |

## Criterios de uso

- **Padding interno de componentes:** `space-3` a `space-5`, según densidad del componente.
- **Márgenes entre elementos de un mismo grupo** (ej. campos de formulario): `space-3` a `space-4`.
- **Separación entre secciones funcionales distintas:** `space-6` a `space-8`.
- **Separación entre bloques narrativos/editoriales** (landing, detalle de película): `space-8` a `space-10`.

## Regla general

Cuanto más relacionados semánticamente estén dos elementos, menor debe ser el espaciado entre ellos; cuanto más distintos sean sus propósitos, mayor la separación. Ningún valor de espaciado fuera de esta escala ("magic numbers") puede usarse en producción.

---

[⬅ Tipografía](./04-tipografia.md) · [Volver al índice](./README.md) · [Siguiente: Border radius ➡](./06-border-radius.md)
