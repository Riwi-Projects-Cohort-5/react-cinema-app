[⬅ Volver al índice](./README.md)

# 04 — Tipografía

## Fuente principal — Space Grotesk

Tipografía geométrica sans-serif de la familia Grotesk contemporánea, con carácter técnico y personalidad editorial. Sus formas ligeramente inusuales (especialmente en números y mayúsculas) le dan distinción sin sacrificar legibilidad.

**Razón de la elección:** combina precisión geométrica (afín al ADN tecnológico del producto) con calidez tipográfica (afín a la experiencia editorial/cinematográfica), y es notablemente menos utilizada que alternativas como Poppins o Montserrat, aportando diferenciación de marca real.

Pesos disponibles: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold).

## Fuente secundaria — General Sans

Sans-serif neutra, altamente legible, pensada para bloques largos de texto (descripciones de películas, sinopsis, políticas).

**Razón de la elección:** su neutralidad equilibra el carácter más expresivo de Space Grotesk, garantizando legibilidad óptima en textos extensos sin competir visualmente con los titulares.

Pesos disponibles: 400 (Regular), 500 (Medium), 600 (SemiBold).

> **Fallback:** si en algún entorno de desarrollo no es viable instalar General Sans (es una fuente de Fontshare, no está en Google Fonts por defecto), usar **Inter** como alternativa de respaldo — mismo espíritu neutro y alta legibilidad.

## Escala tipográfica

| Nivel        | Tamaño | Peso           | Line Height | Letter Spacing     | Fuente        | Uso recomendado                                                     |
| ------------ | ------ | -------------- | ----------- | ------------------ | ------------- | ------------------------------------------------------------------- |
| **Display**  | 57px   | 700 (Bold)     | 64px (1.12) | -0.02em            | Space Grotesk | Hero de landing, títulos de campañas destacadas                     |
| **Headline** | 40px   | 700 (Bold)     | 48px (1.2)  | -0.015em           | Space Grotesk | Títulos de sección, nombre de película en detalle                   |
| **Title**    | 28px   | 600 (SemiBold) | 36px (1.28) | -0.01em            | Space Grotesk | Encabezados de tarjetas, subsecciones                               |
| **Subtitle** | 20px   | 500 (Medium)   | 28px (1.4)  | 0em                | Space Grotesk | Subtítulos, encabezados de listas                                   |
| **Body**     | 16px   | 400 (Regular)  | 24px (1.5)  | 0em                | General Sans  | Texto general, descripciones, sinopsis                              |
| **Caption**  | 13px   | 400 (Regular)  | 18px (1.38) | 0.01em             | General Sans  | Metadatos, etiquetas, texto de apoyo                                |
| **Overline** | 11px   | 600 (SemiBold) | 16px (1.45) | 0.08em (uppercase) | General Sans  | Etiquetas de categoría, estados ("EN CARTELERA", "PRÓXIMO ESTRENO") |

## Reglas de uso

- **Space Grotesk se reserva para titulares y elementos de marca** (Display, Headline, Title, Subtitle). **General Sans se usa para todo contenido de lectura extensa** (Body, Caption, Overline).
- Ningún nivel debe usar pesos fuera de los rangos disponibles de cada fuente (Space Grotesk: 300–700 · General Sans: 400–600).
- El título de una tarjeta o listado nunca ocupa más de una línea; usar truncamiento (`...`) antes que dejar que el texto rompa el layout.
- La jerarquía visual se construye primero con tipografía y espaciado, y solo después con color — el color nunca es el único mecanismo para indicar importancia.

---
