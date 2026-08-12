# React Cinema App — UI Foundations

**Sistema de Diseño · Documento de Fundamentos Visuales**
Versión 1.0 · Documentación oficial del proyecto
Ubicación sugerida: `docs/design-system/UI-Foundations.md`

---

## Índice

1. [Filosofía del Diseño](#1-filosofía-del-diseño)
2. [Identidad Visual](#2-identidad-visual)
3. [Paleta de Colores](#3-paleta-de-colores)
4. [Tipografía](#4-tipografía)
5. [Sistema de Espaciado](#5-sistema-de-espaciado)
6. [Border Radius](#6-border-radius)
7. [Elevación](#7-elevación)
8. [Bordes](#8-bordes)
9. [Opacidad](#9-opacidad)
10. [Iconografía](#10-iconografía)
11. [Sistema de Grid](#11-sistema-de-grid)
12. [Responsive Foundations](#12-responsive-foundations)
13. [Sistema de Animaciones](#13-sistema-de-animaciones)
14. [Accesibilidad](#14-accesibilidad)
15. [Tokens de Diseño](#15-tokens-de-diseño)
16. [Reglas Generales](#16-reglas-generales)

---

## 1. Filosofía del Diseño

### 1.1 Objetivo del sistema visual

El sistema visual de **React Cinema App** existe para transformar la compra de entradas de cine —un proceso históricamente funcional y genérico— en una experiencia digital que se sienta **premium, precisa y cinematográfica**. El objetivo no es decorar la interfaz con referencias literales al cine (proyectores, cortinas rojas, palomitas), sino **capturar la sensación de estar dentro de una sala oscura justo antes de que empiece la película**: expectación, foco absoluto y calma.

Cada decisión visual —color, tipografía, espaciado, movimiento— debe responder a una pregunta central: *¿esto ayuda al usuario a sentir que está entrando en una experiencia cuidada, o es ruido visual?*

### 1.2 Personalidad de la marca

| Rasgo | Descripción |
|---|---|
| **Precisa** | Cada elemento tiene un propósito. Nada es decorativo por sí mismo. |
| **Serena** | La interfaz no compite por atención; guía sin gritar. |
| **Contemporánea** | Estética afín a productos de software premium (Linear, Stripe, Notion), no a carteleras de cine tradicionales. |
| **Exclusiva** | Transmite curaduría: pocas opciones bien presentadas, no saturación. |
| **Cálida bajo la superficie** | Fría en su base tonal, pero con acentos vibrantes que humanizan la experiencia. |

### 1.3 Valores que transmite

- **Claridad** — la información (horarios, salas, asientos, precios) siempre es legible al instante.
- **Confianza** — un sistema de compra debe sentirse seguro y estable visualmente.
- **Sofisticación sin elitismo** — premium, pero accesible y cercano.
- **Consistencia** — la misma lógica visual se repite en todos los flujos, sin sorpresas.

### 1.4 Principios de diseño

1. **Oscuridad con propósito** — el fondo oscuro no es una moda estética, sino una metáfora funcional de la sala de cine: enfoca la atención en el contenido (pósters, imágenes, CTAs).
2. **Jerarquía antes que decoración** — el contraste y el tamaño comunican importancia; el color se reserva para significado, no para relleno.
3. **Espacio como lujo** — el whitespace generoso comunica exclusividad; la interfaz nunca se siente apretada.
4. **Un acento, una intención** — un solo color vibrante domina las acciones primarias; todo lo demás es neutro.
5. **Movimiento sutil, nunca decorativo** — las transiciones existen para orientar, no para impresionar.

### 1.5 Sensaciones que debe generar en el usuario

- Al abrir la app: *"esto se siente cuidado y moderno."*
- Al navegar cartelera: *"encuentro lo que busco sin esfuerzo."*
- Al seleccionar asientos y pagar: *"esto es rápido, claro y seguro."*
- Al finalizar la compra: *"quiero volver a usar esta app."*

---

## 2. Identidad Visual

### 2.1 Mood

**"Cine nocturno de autor, con alma de producto tecnológico."** La atmósfera evoca una sala de proyección minimalista y contemporánea: oscuridad profunda, luz controlada y un único punto de color vibrante que actúa como "la pantalla encendida en la oscuridad".

### 2.2 Personalidad visual

Interfaz oscura, editorial y estructurada, con tipografía como protagonista y el color como recurso escaso y deliberado. Se aleja completamente del imaginario clásico del cine comercial (rojo/amarillo/negro-rojo) y se acerca al lenguaje visual de plataformas premium de entretenimiento y software de alta gama.

### 2.3 Estilo gráfico

- Superficies planas con profundidad sutil mediante elevación, no mediante gradientes decorativos.
- Composición basada en retícula estricta (grid), con alineaciones limpias.
- Imágenes (pósters, backdrops) tratadas como elementos editoriales, con overlays oscuros para mantener legibilidad tipográfica.
- Ausencia de ornamentación: sin ilustraciones recargadas, sin patrones, sin texturas ruidosas.

### 2.4 Nivel de minimalismo

Alto. La interfaz prioriza contenido y funcionalidad sobre elementos gráficos. Cada componente visual debe poder justificarse funcionalmente; si no aporta claridad o jerarquía, no existe.

### 2.5 Uso del espacio

Generoso y respirado. El espacio negativo se trata como un elemento activo de diseño, no como un remanente. Las zonas de mayor densidad de información (asientos, horarios) usan espaciado más compacto pero siempre consistente con la escala definida en la sección 5.

### 2.6 Contraste

Alto contraste tipográfico (texto claro sobre fondo oscuro) para legibilidad inmediata. Contraste cromático reservado casi exclusivamente para el color primario/acento, de modo que cualquier elemento de color destaque naturalmente frente al entorno neutro.

### 2.7 Profundidad

La profundidad se comunica mediante **capas de superficie** (background → surface → surface variant) y **elevación sutil** (sombras suaves, nunca dramáticas), no mediante efectos 3D, gradientes intensos o glassmorphism excesivo. Se permite un uso puntual y elegante de efecto "glass" (ver sección 9) en overlays y modales.

### 2.8 Iluminación

Iluminación conceptual tipo "luz de proyector": puntos de foco suaves y difusos en zonas de interés (imágenes destacadas, CTAs principales), rodeados de oscuridad estable. No se usan resplandores agresivos ni neones saturados.

### 2.9 Inspiraciones visuales

- **Linear** — precisión tipográfica y uso disciplinado del color de acento.
- **Stripe** — estructura, orden y confianza visual en flujos transaccionales.
- **Notion** — minimalismo funcional y jerarquía tipográfica clara.
- **Figma** — superficies oscuras bien estratificadas.
- **Salas de cine boutique / festivales de cine de autor** — como referencia conceptual de atmósfera, no de paleta literal.

---

## 3. Paleta de Colores

Paleta original, diseñada nativamente para modo oscuro (dark-first), con arquitectura preparada para una futura expansión a modo claro. Se evita deliberadamente cualquier combinación asociada al cine tradicional (rojo, amarillo, negro-rojo).

Concepto: **"Obsidian Indigo"** — una base neutra azul-carbón profunda, con un primario índigo eléctrico y un acento cian-menta que funciona como "la pantalla encendida".

### 3.1 Colores base y superficies

| Nombre | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Background | `#0A0B10` | Fondo base de toda la aplicación | Negro azulado profundo que evita el negro puro (`#000000`), reduciendo fatiga visual y aportando carácter cinematográfico sin dureza. |
| Surface | `#13151C` | Tarjetas, contenedores, secciones | Un paso de luminosidad por encima del background para crear la primera capa de profundidad. |
| Surface Variant | `#1C1F29` | Elementos anidados, inputs, filas activas | Segunda capa de profundidad; distingue subcomponentes dentro de una superficie. |

### 3.2 Colores de marca

| Nombre | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Primary | `#5B5FEF` | Botones principales, links activos, elementos interactivos clave | Índigo eléctrico: transmite tecnología y sofisticación sin caer en los violetas genéricos de SaaS. Suficientemente saturado para destacar en fondos oscuros. |
| Primary Hover | `#7477F5` | Estado hover/active de elementos primarios | Versión más luminosa del primario; comunica interactividad manteniendo la identidad cromática. |
| Secondary | `#8B8FA3` | Botones secundarios, elementos de apoyo | Gris-azulado neutro que complementa sin competir con el primario. |
| Accent | `#2CE0C1` | Highlights puntuales, badges destacados, elementos "en cartelera ahora" | Cian-menta que funciona como "la pantalla encendida en la sala oscura"; único acento vibrante permitido junto al primario, reservado para momentos de máxima relevancia. |

### 3.3 Colores semánticos

| Nombre | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Success | `#3DD68C` | Confirmaciones, compra exitosa, disponibilidad | Verde esmeralda desaturado, coherente con la temperatura fría de la paleta. |
| Warning | `#E8A83C` | Últimos asientos, avisos no críticos | Ámbar suave; se evita el amarillo puro para no asociarse a la iconografía tradicional del cine. |
| Error | `#EF5B6B` | Errores de formulario, pagos fallidos, asientos no disponibles | Rosa-rojo coralino, no un rojo cinematográfico clásico; mantiene la sensación premium incluso en estados negativos. |
| Info | `#4EA1F5` | Mensajes informativos, tooltips | Azul claro neutro, complementario al primario sin duplicarlo. |

### 3.4 Colores tipográficos

| Nombre | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Text Primary | `#F5F6FA` | Titulares, texto principal | Blanco roto (no `#FFFFFF` puro) para reducir el contraste agresivo típico de fondos muy oscuros. |
| Text Secondary | `#A2A6B8` | Subtítulos, descripciones, metadatos | Gris-azulado medio; jerarquía clara sin perder legibilidad. |
| Text Disabled | `#5B5E6D` | Texto inactivo, placeholders | Suficiente contraste para ser legible como "desactivado", sin confundirse con texto activo. |

### 3.5 Bordes y divisores

| Nombre | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Border | `#272B36` | Contornos de inputs, tarjetas, botones outline | Sutil sobre surface, define límites sin crear ruido visual. |
| Divider | `#1D202A` | Líneas separadoras entre secciones | Ligeramente más discreto que border; para separación estructural, no funcional. |

### 3.6 Consideraciones para expansión a modo claro

La arquitectura de tokens (background/surface/surface-variant + primary/secondary/accent + semánticos + texto + bordes) es agnóstica a la luminosidad base. Una futura versión clara deberá invertir la escala de neutros manteniendo el mismo primario (`#5B5FEF`) y accent (`#2CE0C1`) como constantes de marca, ajustando su saturación si fuera necesario para cumplir contraste WCAG sobre fondo claro.

---

## 4. Tipografía

### 4.1 Fuente principal

**Space Grotesk**

Tipografía geométrica sans-serif de la familia Grotesk contemporánea, con carácter técnico y personalidad editorial. Sus formas ligeramente inusuales (especialmente en números y mayúsculas) le dan distinción sin sacrificar legibilidad, evitando la sensación "genérica de SaaS" de fuentes ya sobreexplotadas.

**Razón de la elección:** combina precisión geométrica (afín al ADN tecnológico del producto) con calidez tipográfica (afín a la experiencia editorial/cinematográfica), y es notablemente menos utilizada que alternativas como Poppins o Montserrat, aportando diferenciación de marca real.

### 4.2 Fuente secundaria

**General Sans**

Sans-serif neutra, altamente legible, pensada para bloques largos de texto (descripciones de películas, sinopsis, políticas).

**Razón de la elección:** su neutralidad equilibra el carácter más expresivo de Space Grotesk, garantizando legibilidad óptima en textos extensos sin competir visualmente con los titulares.

### 4.3 Escala tipográfica

| Nivel | Tamaño | Peso | Line Height | Letter Spacing | Uso recomendado |
|---|---|---|---|---|---|
| **Display** | 57px | 700 (Bold) | 64px (1.12) | -0.02em | Hero de landing, títulos de campañas destacadas |
| **Headline** | 40px | 700 (Bold) | 48px (1.2) | -0.015em | Títulos de sección, nombre de película en detalle |
| **Title** | 28px | 600 (SemiBold) | 36px (1.28) | -0.01em | Encabezados de tarjetas, subsecciones |
| **Subtitle** | 20px | 500 (Medium) | 28px (1.4) | 0em | Subtítulos, encabezados de listas |
| **Body** | 16px | 400 (Regular) | 24px (1.5) | 0em | Texto general, descripciones, sinopsis |
| **Caption** | 13px | 400 (Regular) | 18px (1.38) | 0.01em | Metadatos, etiquetas, texto de apoyo |
| **Overline** | 11px | 600 (SemiBold) | 16px (1.45) | 0.08em (uppercase) | Etiquetas de categoría, estados ("EN CARTELERA", "PRÓXIMO ESTRENO") |

> **Nota:** los pesos disponibles de Space Grotesk son 300–700; General Sans cubre 400–600. Ningún nivel debe usar pesos fuera de estos rangos.

---

## 5. Sistema de Espaciado

### 5.1 Unidad base

**4px**, con escala progresiva basada en múltiplos que permite consistencia matemática en todo el sistema.

### 5.2 Escala de espaciado

| Token | Valor | Uso recomendado |
|---|---|---|
| `space-1` | 4px | Separación mínima (icono + texto, elementos muy compactos) |
| `space-2` | 8px | Padding interno reducido, separación entre elementos relacionados |
| `space-3` | 12px | Padding estándar en componentes pequeños |
| `space-4` | 16px | Padding base de tarjetas y contenedores; separación entre elementos de formulario |
| `space-5` | 24px | Separación entre bloques dentro de una sección |
| `space-6` | 32px | Padding de secciones medianas |
| `space-7` | 48px | Separación entre secciones principales |
| `space-8` | 64px | Márgenes de sección en desktop |
| `space-9` | 96px | Separación entre grandes bloques editoriales (hero, secciones de landing) |
| `space-10` | 128px | Márgenes superiores/inferiores de página en layouts amplios |

### 5.3 Criterios de uso

- **Padding interno de componentes:** `space-3` a `space-5`, según densidad del componente.
- **Márgenes entre elementos de un mismo grupo (ej. campos de formulario):** `space-3` a `space-4`.
- **Separación entre secciones funcionales distintas:** `space-6` a `space-8`.
- **Separación entre bloques narrativos/editoriales (landing, detalle de película):** `space-8` a `space-10`.
- Regla general: cuanto más relacionados semánticamente estén dos elementos, menor debe ser el espaciado entre ellos; cuanto más distintos sean sus propósitos, mayor la separación.

---

## 6. Border Radius

Escala moderada que aporta suavidad sin infantilizar la interfaz, coherente con el carácter premium y técnico del producto.

| Token | Valor | Uso recomendado |
|---|---|---|
| **XS** | 4px | Badges, chips pequeños, checkboxes |
| **SM** | 8px | Inputs, botones pequeños, tags |
| **MD** | 12px | Botones estándar, campos de formulario, elementos interactivos base |
| **LG** | 16px | Tarjetas de contenido (películas, funciones) |
| **XL** | 24px | Contenedores grandes, modales, superficies destacadas |
| **Full** | 999px | Elementos circulares (avatares, indicadores de estado, pills) |

**Principio general:** a mayor tamaño del componente, mayor puede ser su radio, siempre manteniendo proporción visual. Nunca mezclar radios de escalas no contiguas dentro de un mismo grupo de componentes.

---

## 7. Elevación

Sistema de profundidad sutil, pensado para fondos oscuros donde las sombras tradicionales son menos perceptibles que en interfaces claras. Se prioriza el uso combinado de sombra + diferencia de luminosidad de superficie sobre sombras muy marcadas.

| Nivel | Offset (Y) | Blur | Opacidad | Uso recomendado |
|---|---|---|---|---|
| **Shadow XS** | 1px | 2px | 0.16 | Elementos ligeramente elevados sobre su superficie base (chips, inputs en focus) |
| **Shadow SM** | 2px | 6px | 0.20 | Tarjetas en reposo (pósters, listados) |
| **Shadow MD** | 4px | 12px | 0.24 | Tarjetas en estado hover, dropdowns |
| **Shadow LG** | 8px | 24px | 0.28 | Popovers, menús contextuales, tooltips extensos |
| **Shadow XL** | 16px | 40px | 0.32 | Modales, diálogos de confirmación de compra |

**Principio de uso:** la elevación debe reflejar jerarquía de interacción real (qué está "más cerca" del usuario en un momento dado), nunca usarse como recurso puramente decorativo. Todas las sombras usan un tono base neutro-frío (derivado de `#000000` a las opacidades indicadas) para mantener coherencia con la temperatura general de la paleta.

---

## 8. Bordes

| Propiedad | Especificación |
|---|---|
| **Grosor estándar** | 1px, para la gran mayoría de componentes (inputs, cards, botones outline) |
| **Grosor de énfasis** | 1.5px, reservado para estados de foco o selección activa |
| **Color base** | `Border` (`#272B36`) para contornos neutros |
| **Color de énfasis** | `Primary` (`#5B5FEF`) para bordes en estado activo/focus/seleccionado |
| **Color de error** | `Error` (`#EF5B6B`) para bordes de validación fallida |
| **Opacidad** | Los bordes neutros se usan siempre al 100% de opacidad de su token; no se reduce opacidad para evitar inconsistencias de contraste entre superficies |

**Casos de uso:**
- Separación de contenedores sobre fondos del mismo tono de superficie (donde la sombra no es suficiente).
- Delimitación de campos interactivos (inputs, selects).
- Indicación de estado (focus, error, selección) mediante cambio de color de borde, siempre combinado con otro indicador (no exclusivamente color, ver sección 14).

---

## 9. Opacidad

Sistema de opacidades consistente para estados y efectos, expresado como porcentaje sobre el color base correspondiente.

| Token | Valor | Uso recomendado |
|---|---|---|
| `opacity-hover` | 8% | Overlay sutil al pasar el cursor sobre elementos interactivos |
| `opacity-active` | 12% | Overlay al presionar/activar un elemento |
| `opacity-disabled` | 40% | Reducción de opacidad general para elementos deshabilitados |
| `opacity-overlay` | 64% | Fondos oscuros detrás de modales y drawers, sobre `Background` |
| `opacity-scrim` | 72% | Overlay sobre imágenes (pósters, backdrops) para garantizar legibilidad de texto superpuesto |
| `opacity-glass` | 40% + blur | Efecto "glass" puntual en barras de navegación flotantes o overlays premium, combinando `Surface` al 40% con desenfoque de fondo |

**Principio general:** la opacidad se usa para comunicar estado o jerarquía temporal (hover, disabled, overlay), nunca como sustituto de un color semántico definido.

---

## 10. Iconografía

### 10.1 Librería recomendada

**Phosphor Icons** (variante *Regular* como base, *Bold* para estados activos/seleccionados).

### 10.2 Estilo

Lineal, geométrico y de esquinas suavemente redondeadas, coherente con el border radius del sistema (sección 6) y con el carácter técnico-editorial de la tipografía elegida.

### 10.3 Grosor

- **Regular (1.5px de trazo aparente):** uso general, estado por defecto.
- **Bold:** exclusivamente para iconos en estado activo/seleccionado o dentro de elementos ya destacados (botones primarios), nunca combinado con Regular en un mismo contexto.

### 10.4 Tamaños

| Token | Valor | Uso |
|---|---|---|
| `icon-sm` | 16px | Iconos inline con texto (Caption/Body) |
| `icon-md` | 20px | Iconos en botones, inputs, navegación |
| `icon-lg` | 24px | Iconos destacados, encabezados de sección |
| `icon-xl` | 32px | Iconos ilustrativos en estados vacíos o de confirmación |

### 10.5 Consistencia

Todos los iconos deben provenir de la misma librería y variante de grosor dentro de un mismo contexto visual. No se permite mezclar librerías de iconos bajo ninguna circunstancia, para preservar coherencia formal en todo el producto.

---

## 11. Sistema de Grid

| Propiedad | Desktop | Tablet | Mobile |
|---|---|---|---|
| **Columnas** | 12 | 8 | 4 |
| **Gutter** | 24px | 20px | 16px |
| **Margen de contenedor** | 64px | 32px | 16px |
| **Max Width (container)** | 1280px | 100% | 100% |

### 11.1 Principios del grid

- El grid de 12 columnas en desktop permite composiciones editoriales flexibles (ej. hero asimétrico, listados en 3–4 columnas de tarjetas).
- El grid de 8 columnas en tablet prioriza legibilidad y evita densidad excesiva de contenido.
- El grid de 4 columnas en mobile se usa principalmente para alinear elementos verticalmente apilados, más que para composiciones multi-columna.
- El contenedor central (`max-width`) evita que el contenido se estire excesivamente en pantallas muy anchas, preservando proporciones editoriales.

---

## 12. Responsive Foundations

| Breakpoint | Rango | Comportamiento esperado |
|---|---|---|
| **Mobile** | 0–599px | Layout de una sola columna; navegación colapsada (menú/tab bar); tipografía en tamaños base sin escalado adicional; tarjetas a ancho completo. |
| **Tablet** | 600–1023px | Introducción de 2 columnas en listados; navegación lateral opcional; márgenes moderados. |
| **Laptop** | 1024–1439px | Grid completo de 12 columnas; navegación completa visible; listados en 3 columnas. |
| **Desktop** | 1440–1919px | Máximo aprovechamiento del grid; listados en 3–4 columnas; jerarquía tipográfica completa (incluye Display). |
| **Wide Screen** | ≥1920px | Contenido limitado por `max-width` del contenedor (1280px) centrado; el espacio adicional se resuelve con márgenes laterales, no con estiramiento de componentes. |

**Principio transversal:** ningún componente cambia su lógica de interacción entre breakpoints, solo su disposición espacial y densidad de información visible.

---

## 13. Sistema de Animaciones

### 13.1 Duraciones

| Token | Valor | Uso |
|---|---|---|
| `duration-instant` | 100ms | Micro-feedback (cambios de color en hover/press) |
| `duration-fast` | 150ms | Transiciones de componentes pequeños (tooltips, chips) |
| `duration-base` | 200ms | Transiciones estándar (aparición de dropdowns, cambios de estado) |
| `duration-moderate` | 300ms | Transiciones de componentes medianos (cards, acordeones) |
| `duration-slow` | 400ms | Transiciones de layout (modales, drawers, cambios de página) |

### 13.2 Curvas (easing)

| Token | Curva | Uso |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transiciones generales de entrada/salida |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Elementos que entran en pantalla (aparición) |
| `ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Elementos que salen de pantalla (desaparición) |

### 13.3 Principios

1. **El movimiento orienta, no decora.** Toda animación debe responder a una necesidad de continuidad espacial o feedback funcional.
2. **Sutileza sobre espectacularidad.** Se prioriza la sensación de fluidez sobre el efecto llamativo.
3. **Consistencia de dirección.** Los elementos que aparecen desde un origen (ej. un botón) deben mantener coherencia direccional con su destino.
4. **Reducción de movimiento respetada.** El sistema debe honrar la preferencia del usuario `prefers-reduced-motion`, sustituyendo animaciones de desplazamiento por transiciones de opacidad simples.

### 13.4 Microinteracciones

Reservadas para puntos de decisión o confirmación del usuario (selección de asiento, confirmación de compra, cambio de estado de favorito). No se aplican microinteracciones a elementos puramente informativos.

---

## 14. Accesibilidad

Basado en **WCAG 2.2**, nivel AA como estándar mínimo del producto.

### 14.1 Contraste mínimo

- Texto normal (Body, Caption): relación de contraste **≥ 4.5:1** respecto a su fondo.
- Texto grande (Title, Headline, Display, ≥24px o ≥19px bold): relación de contraste **≥ 3:1**.
- Elementos gráficos e indicadores de estado (iconos funcionales, bordes de input): **≥ 3:1** respecto al fondo adyacente.
- Todos los pares texto/fondo definidos en la sección 3 deben validarse contra esta escala antes de su implementación final.

### 14.2 Tamaños mínimos de texto

- Tamaño mínimo absoluto en cualquier contexto: **13px** (nivel Caption), reservado a metadatos no críticos.
- Texto funcional o de lectura principal nunca por debajo de **16px** (nivel Body).

### 14.3 Espaciado

- Área táctil mínima para elementos interactivos: **44×44px**, independientemente del tamaño visual del ícono o texto contenido.
- Separación mínima entre elementos interactivos adyacentes: **8px**, para evitar activaciones accidentales.

### 14.4 Estados de foco

- Todo elemento interactivo debe tener un estado de foco visible y distinguible, mediante borde de énfasis (`Primary`, ver sección 8) combinado con un halo de opacidad, nunca solo con cambio de color de fondo.
- El foco nunca debe eliminarse (`outline: none`) sin un reemplazo visual equivalente o superior en visibilidad.

### 14.5 Navegación mediante teclado

- Todo flujo crítico (búsqueda, selección de función, selección de asiento, checkout) debe ser completable exclusivamente con teclado.
- El orden de tabulación debe seguir la jerarquía visual y lógica del contenido, sin saltos inesperados.
- Los componentes personalizados (selectores de asiento, carruseles) deben exponer roles y estados ARIA equivalentes a su comportamiento visual.

---

## 15. Tokens de Diseño

Estructura inicial de Design Tokens. Documentación de la nomenclatura y jerarquía; no se incluye implementación en código.

### 15.1 Color

```
color.background
color.surface
color.surface-variant
color.primary
color.primary-hover
color.secondary
color.accent
color.success
color.warning
color.error
color.info
color.text-primary
color.text-secondary
color.text-disabled
color.border
color.divider
```

### 15.2 Tipografía

```
font.family.primary
font.family.secondary
font.size.display
font.size.headline
font.size.title
font.size.subtitle
font.size.body
font.size.caption
font.size.overline
font.weight.regular
font.weight.medium
font.weight.semibold
font.weight.bold
font.line-height.display
font.line-height.headline
font.line-height.title
font.line-height.subtitle
font.line-height.body
font.line-height.caption
font.line-height.overline
font.letter-spacing.display
font.letter-spacing.headline
font.letter-spacing.title
font.letter-spacing.subtitle
font.letter-spacing.body
font.letter-spacing.caption
font.letter-spacing.overline
```

### 15.3 Espaciado

```
spacing.1
spacing.2
spacing.3
spacing.4
spacing.5
spacing.6
spacing.7
spacing.8
spacing.9
spacing.10
```

### 15.4 Radio

```
radius.xs
radius.sm
radius.md
radius.lg
radius.xl
radius.full
```

### 15.5 Sombra

```
shadow.xs
shadow.sm
shadow.md
shadow.lg
shadow.xl
```

### 15.6 Borde

```
border.width.default
border.width.emphasis
border.color.default
border.color.emphasis
border.color.error
```

### 15.7 Opacidad

```
opacity.hover
opacity.active
opacity.disabled
opacity.overlay
opacity.scrim
opacity.glass
```

### 15.8 Animación

```
motion.duration.instant
motion.duration.fast
motion.duration.base
motion.duration.moderate
motion.duration.slow
motion.easing.standard
motion.easing.decelerate
motion.easing.accelerate
```

### 15.9 Grid y layout

```
grid.columns.desktop
grid.columns.tablet
grid.columns.mobile
grid.gutter.desktop
grid.gutter.tablet
grid.gutter.mobile
layout.container.max-width
layout.breakpoint.mobile
layout.breakpoint.tablet
layout.breakpoint.laptop
layout.breakpoint.desktop
layout.breakpoint.wide
```

---

## 16. Reglas Generales

Estas reglas son de cumplimiento obligatorio para todo el equipo de diseño y desarrollo, y deben respetarse en cualquier componente, pantalla o flujo construido a partir de este documento.

1. **Ningún color fuera de la paleta definida en la sección 3 puede introducirse** sin pasar por un proceso de revisión y actualización formal de este documento.
2. **El color de acento (`Accent`) es un recurso escaso.** Debe usarse en un máximo de un elemento destacado por vista, salvo excepciones justificadas (ej. estados "en cartelera ahora").
3. **La tipografía Space Grotesk se reserva para titulares y elementos de marca** (Display, Headline, Title, Overline); General Sans se usa para todo contenido de lectura extensa (Body, Subtitle, Caption).
4. **Toda medida de espaciado, radio, sombra y tipografía debe provenir de la escala definida**, nunca de valores arbitrarios ("magic numbers").
5. **El fondo oscuro es la base por defecto del producto.** Cualquier exploración de modo claro debe partir de los tokens semánticos definidos, no de una paleta nueva.
6. **La jerarquía visual se construye primero con tipografía y espaciado, y solo después con color.** El color nunca debe ser el único mecanismo para comunicar jerarquía o estado.
7. **Toda superficie oscura adicional debe derivarse de la escala Background → Surface → Surface Variant**, sin introducir tonos intermedios no documentados.
8. **La accesibilidad (sección 14) no es opcional.** Ningún componente puede aprobarse para producción si no cumple los mínimos de contraste, tamaño y navegación por teclado definidos.
9. **Las animaciones deben ser funcionales, breves y coherentes con las curvas y duraciones definidas en la sección 13.** Cualquier animación fuera de esta escala requiere justificación explícita.
10. **Este documento es la fuente única de verdad para los fundamentos visuales del proyecto.** Cualquier cambio debe versionarse y comunicarse a todo el equipo antes de su adopción en componentes o pantallas.

---

*Documento vivo. Su evolución debe registrarse mediante control de versiones dentro de `docs/design-system/`.*
