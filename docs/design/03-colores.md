[⬅ Volver al índice](./README.md)

# 03 — Paleta de Colores

Paleta original bajo el concepto **"Obsidian Indigo"**: base neutra azul-carbón profunda, primario índigo eléctrico y acento cian-menta que funciona como "la pantalla encendida en la oscuridad". Se evita deliberadamente cualquier combinación asociada al cine tradicional (rojo, amarillo, negro-rojo).

El proyecto es **dark-first** (el modo oscuro es la experiencia por defecto), pero cada color tiene definida su variante **Light** para una futura expansión, manteniendo el primario y el acento como constantes de marca en ambos modos.

> Para la tabla lista para implementar en código (nombre de variable CSS, valor Light, valor Dark, uso), ver [15 — Design Tokens](./15-design-tokens.md). Este documento explica el **porqué** de cada color; ese otro documento es la referencia técnica de implementación.

## Fondos y superficies

| Color           | Dark (HEX) | Light (HEX) | Uso recomendado                           | Justificación                                                                                                                                                                                 |
| --------------- | ---------- | ----------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background      | `#0A0B10`  | `#F7F8FC`   | Fondo base de toda la aplicación          | Negro azulado profundo (no negro puro) que reduce fatiga visual sin perder carácter cinematográfico. En light, un blanco frío ligeramente azulado que mantiene la misma temperatura de marca. |
| Surface         | `#13151C`  | `#FFFFFF`   | Tarjetas, contenedores, secciones         | Primera capa de profundidad sobre el background.                                                                                                                                              |
| Surface Variant | `#1C1F29`  | `#EEF0F6`   | Elementos anidados, inputs, filas activas | Segunda capa de profundidad; distingue subcomponentes dentro de una superficie.                                                                                                               |

## Colores de marca

| Color         | Dark (HEX) | Light (HEX) | Uso recomendado                                                              | Justificación                                                                                                                                     |
| ------------- | ---------- | ----------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary       | `#5B5FEF`  | `#5B5FEF`   | Botones principales, links activos, elementos interactivos clave             | Índigo eléctrico: tecnología y sofisticación sin caer en violetas genéricos de SaaS. Se mantiene idéntico en ambos modos como constante de marca. |
| Primary Hover | `#7477F5`  | `#4A4DD1`   | Estado hover/active de elementos primarios                                   | En dark se aclara (más luminoso sobre fondo oscuro); en light se oscurece (mejor contraste sobre fondo claro).                                    |
| Secondary     | `#8B8FA3`  | `#6B7280`   | Botones secundarios, elementos de apoyo                                      | Gris-azulado neutro que complementa sin competir con el primario.                                                                                 |
| Accent        | `#2CE0C1`  | `#0F9C86`   | Highlights puntuales, badges destacados ("En cartelera ahora", "Cine Flash") | Cian-menta: único acento vibrante permitido junto al primario. En light se oscurece para mantener contraste AA sobre fondos blancos.              |

## Colores semánticos

| Color   | Dark (HEX) | Light (HEX) | Uso recomendado                                                | Justificación                                                                                                       |
| ------- | ---------- | ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Success | `#3DD68C`  | `#1E9E63`   | Confirmaciones, compra exitosa, disponibilidad                 | Verde esmeralda desaturado, coherente con la temperatura fría de la paleta.                                         |
| Warning | `#E8A83C`  | `#B57516`   | Últimos asientos, avisos no críticos                           | Ámbar suave; se evita el amarillo puro para no asociarse a la iconografía tradicional del cine.                     |
| Error   | `#EF5B6B`  | `#D93F52`   | Errores de formulario, pagos fallidos, asientos no disponibles | Rosa-rojo coralino, no un rojo cinematográfico clásico; mantiene la sensación premium incluso en estados negativos. |
| Info    | `#4EA1F5`  | `#2B7FD6`   | Mensajes informativos, tooltips                                | Azul claro neutro, complementario al primario sin duplicarlo.                                                       |

## Colores tipográficos

| Color          | Dark (HEX) | Light (HEX) | Uso recomendado                      | Justificación                                                                                                                      |
| -------------- | ---------- | ----------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Text Primary   | `#F5F6FA`  | `#101217`   | Titulares, texto principal           | Blanco roto en dark (no `#FFFFFF` puro) y casi-negro en light, ambos para reducir el contraste agresivo de los extremos absolutos. |
| Text Secondary | `#A2A6B8`  | `#4B4F5C`   | Subtítulos, descripciones, metadatos | Gris-azulado medio; jerarquía clara sin perder legibilidad en ambos modos.                                                         |
| Text Disabled  | `#5B5E6D`  | `#9CA0AC`   | Texto inactivo, placeholders         | Contraste suficiente para leerse como "desactivado", sin confundirse con texto activo.                                             |

## Bordes y divisores

| Color   | Dark (HEX) | Light (HEX) | Uso recomendado                                | Justificación                                                               |
| ------- | ---------- | ----------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| Border  | `#272B36`  | `#E1E4EC`   | Contornos de inputs, tarjetas, botones outline | Sutil sobre la superficie correspondiente; define límites sin ruido visual. |
| Divider | `#1D202A`  | `#ECEEF3`   | Líneas separadoras entre secciones             | Más discreto que Border; separación estructural, no funcional.              |

## Reglas de uso de la paleta

- Ningún color fuera de esta tabla puede introducirse en una pantalla sin pasar por una actualización formal de este documento.
- El **Accent** es un recurso escaso: máximo un elemento destacado por vista (salvo excepciones justificadas, ej. estados "en cartelera ahora").
- El color nunca es el único mecanismo para comunicar estado o jerarquía (ver [14 — Accesibilidad](./14-accesibilidad.md)).
- Toda superficie adicional se deriva de la escala Background → Surface → Surface Variant; no se introducen tonos intermedios no documentados.

---
