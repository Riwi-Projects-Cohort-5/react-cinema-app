# Multicine API — Catálogo de endpoints para frontend

Contrato de API orientado a frontend para la plataforma web de Multicine.

> Alcance: este documento es la **fuente de verdad para los equipos de frontend**. Cada endpoint
> tiene su propio documento de contrato. Lee primero **`00-conventions.md`** — define las reglas
> compartidas (autenticación, envelope de error, paginación, dinero, idempotencia, rate limiting)
> que usa todo endpoint.
>
> **Estado de confirmación con el backend:** la colección Postman compartida por el backend es la
> fuente de verdad. Los endpoints **confirmados** son `#2`, `#3`, `#4`, `#6`, `#9`, `#10`, `#11`,
> `#18`, `#20`–`#24` y `#88`–`#90`; sus documentos reflejan los payloads reales. El resto del
> catálogo sigue derivado del backlog *"Historia de usuario Multicine Typescript React"*
> (HU-FE-001 → HU-FE-029) y está marcado como **"Pendiente de confirmación con el backend"** en su
> documento: es contrato propuesto, a validar cuando el backend lo exponga.

## Cómo usar este documento

1. Lee [`00-conventions.md`](00-conventions.md) una vez.
2. Busca tu historia de usuario en el [mapa Historia → Endpoints](#mapa-historia--endpoints) de abajo.
3. Abre el/los contrato(s) correspondiente(s) bajo [`endpoints/`](endpoints/).

URL base: `{{baseUrl}}` (configurable vía `VITE_API_BASE_URL`, ver convenciones §1).

Cada endpoint tiene un **número único (1–90)** usado para referenciarlo en todo el proyecto (PRs,
tareas, pruebas, planeación). El número es estable e independiente del nombre del archivo del doc.

---

## Catálogo de endpoints

### Infraestructura
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 1 | [`GET /health`](endpoints/01-GET-health.md) | Público | HU-FE-001, HU-FE-029 |

### Ubicación
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 2 | [`GET /countries`](endpoints/01-location/02-GET-countries.md) | Público | HU-FE-002, HU-FE-020 |
| 3 | [`GET /departments/{countryId}`](endpoints/01-location/03-GET-departments-countryId.md) | Público | HU-FE-002 |
| 4 | [`GET /cities/{departmentId}`](endpoints/01-location/04-GET-cities-departmentId.md) | Público | HU-FE-002 |
| 5 | [`POST /users/location`](endpoints/01-location/05-POST-users-location.md) | Autenticado | HU-FE-002 |

### Películas y cartelera
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 6 | [`GET /movies`](endpoints/02-movies/06-GET-movies.md) | Público | HU-FE-003, HU-FE-019, HU-FE-029 |
| 7 | [`GET /movies/upcoming`](endpoints/02-movies/07-GET-movies-upcoming.md) | Público | HU-FE-005 |
| 8 | [`GET /movies/cineflash`](endpoints/02-movies/08-GET-movies-cineflash.md) | Público | HU-FE-019 |
| 9 | [`GET /movies/{movieId}`](endpoints/02-movies/09-GET-movies-movieId.md) | Público | HU-FE-004, HU-FE-005, HU-FE-029 |
| 10 | [`GET /movies/{movieId}/functions`](endpoints/02-movies/10-GET-movies-movieId-functions.md) | Público | HU-FE-004, HU-FE-009 |
| 11 | [`GET /movies/{movieId}/recommendations`](endpoints/02-movies/11-GET-movies-movieId-recommendations.md) | Público | HU-FE-004 |
| 88 | [`GET /movies/weekly`](endpoints/02-movies/88-GET-movies-weekly.md) | Público | HU-FE-003 |
| 89 | [`GET /movies/today`](endpoints/02-movies/89-GET-movies-today.md) | Público | HU-FE-003 |
| 90 | [`GET /movies/filter`](endpoints/02-movies/90-GET-movies-filter.md) | Público | HU-FE-003 |

### Funciones
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 12 | [`GET /functions/{functionId}`](endpoints/03-functions/12-GET-functions-functionId.md) | Público | HU-FE-009 |
| 13 | [`GET /functions/{functionId}/prices`](endpoints/03-functions/13-GET-functions-functionId-prices.md) | Público | HU-FE-009 |
| 14 | [`GET /functions/{functionId}/seats`](endpoints/03-functions/14-GET-functions-functionId-seats.md) | Público | HU-FE-010 |

### Reservas de sillas (holds)
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 15 | [`POST /functions/{functionId}/seat-holds`](endpoints/04-reservations/15-POST-functions-functionId-seat-holds.md) | Autenticado | HU-FE-010 |
| 16 | [`DELETE /functions/{functionId}/seat-holds/{holdId}`](endpoints/04-reservations/16-DELETE-functions-functionId-seat-holds-holdId.md) | Autenticado | HU-FE-010 |
| 17 | [`GET /reservations/summary`](endpoints/04-reservations/17-GET-reservations-summary.md) | Autenticado | HU-FE-010 |

### Autenticación
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 18 | [`POST /users`](endpoints/05-auth/18-POST-users.md) | Público | HU-FE-006 |
| 19 | [`POST /auth/verify-email`](endpoints/05-auth/19-POST-auth-verify-email.md) | Público (token) | HU-FE-006 |
| 20 | [`POST /auth/login`](endpoints/05-auth/20-POST-auth-login.md) | Público | HU-FE-007, HU-FE-029 |
| 21 | [`POST /auth/refresh`](endpoints/05-auth/21-POST-auth-refresh.md) | Público (refreshToken en cuerpo) | HU-FE-007, HU-FE-029 |
| 22 | [`POST /auth/logout`](endpoints/05-auth/22-POST-auth-logout.md) | Autenticado (Bearer) | HU-FE-007 |
| 23 | [`POST /auth/forgot-password`](endpoints/05-auth/23-POST-auth-forgot-password.md) | Público | HU-FE-007 |
| 24 | [`POST /auth/reset-password`](endpoints/05-auth/24-POST-auth-reset-password.md) | Público (token) | HU-FE-007 |

### Perfil y membresía
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 25 | [`GET /profile`](endpoints/06-profile/25-GET-profile.md) | Autenticado | HU-FE-008, HU-FE-029 |
| 26 | [`PUT /profile`](endpoints/06-profile/26-PUT-profile.md) | Autenticado | HU-FE-008 |
| 27 | [`POST /profile/photo`](endpoints/06-profile/27-POST-profile-photo.md) | Autenticado | HU-FE-008 |
| 28 | [`GET /membership`](endpoints/07-membership/28-GET-membership.md) | Autenticado | HU-FE-008, HU-FE-029 |
| 29 | [`GET /membership/benefits`](endpoints/07-membership/29-GET-membership-benefits.md) | Autenticado | HU-FE-008 |
| 30 | [`GET /membership/levels`](endpoints/07-membership/30-GET-membership-levels.md) | Autenticado | HU-FE-023 |
| 31 | [`POST /memberships`](endpoints/07-membership/31-POST-memberships.md) | Autenticado | HU-FE-006 |

### Carrito
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 32 | [`POST /cart`](endpoints/08-cart/32-POST-cart.md) | Autenticado | HU-FE-011 |
| 33 | [`GET /cart`](endpoints/08-cart/33-GET-cart.md) | Autenticado | HU-FE-011 |
| 34 | [`PUT /cart`](endpoints/08-cart/34-PUT-cart.md) | Autenticado | HU-FE-011 |
| 35 | [`DELETE /cart`](endpoints/08-cart/35-DELETE-cart.md) | Autenticado | HU-FE-011 |
| 36 | [`POST /cart/snacks`](endpoints/08-cart/36-POST-cart-snacks.md) | Autenticado | HU-FE-012 |
| 37 | [`PUT /cart/snacks/{lineId}`](endpoints/08-cart/37-PUT-cart-snacks-lineId.md) | Autenticado | HU-FE-012 |
| 38 | [`DELETE /cart/snacks/{lineId}`](endpoints/08-cart/38-DELETE-cart-snacks-lineId.md) | Autenticado | HU-FE-012 |
| 39 | [`POST /cart/apply-membership`](endpoints/08-cart/39-POST-cart-apply-membership.md) | Autenticado + miembro | HU-FE-011 |
| 40 | [`POST /cart/apply-giftcard`](endpoints/08-cart/40-POST-cart-apply-giftcard.md) | Autenticado | HU-FE-011, HU-FE-018 |

### Confitería
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 41 | [`GET /snacks`](endpoints/09-snacks/41-GET-snacks.md) | Público | HU-FE-012 |
| 42 | [`GET /snacks/categories`](endpoints/09-snacks/42-GET-snacks-categories.md) | Público | HU-FE-012 |

### Pagos
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 43 | [`POST /payments`](endpoints/10-payments/43-POST-payments.md) | Autenticado | HU-FE-013 |
| 44 | [`GET /payments/{paymentId}`](endpoints/10-payments/44-GET-payments-paymentId.md) | Autenticado | HU-FE-013 |

### Órdenes y compras
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 45 | [`POST /orders`](endpoints/11-orders/45-POST-orders.md) | Autenticado | HU-FE-013, HU-FE-029 |
| 46 | [`GET /orders`](endpoints/11-orders/46-GET-orders.md) | Autenticado | HU-FE-014, HU-FE-016 |
| 47 | [`GET /orders/{orderId}`](endpoints/11-orders/47-GET-orders-orderId.md) | Autenticado (propietario) | HU-FE-016, HU-FE-029 |
| 48 | [`GET /orders/{orderId}/available-functions`](endpoints/11-orders/48-GET-orders-orderId-available-functions.md) | Autenticado (propietario) | HU-FE-016 |
| 49 | [`POST /orders/{orderId}/change-function`](endpoints/11-orders/49-POST-orders-orderId-change-function.md) | Autenticado (propietario) | HU-FE-016 |
| 50 | [`GET /orders/{orderId}/invoice`](endpoints/11-orders/50-GET-orders-orderId-invoice.md) | Autenticado (propietario) | HU-FE-014 |

### Entradas (tickets)
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 51 | [`GET /tickets`](endpoints/12-tickets/51-GET-tickets.md) | Autenticado | HU-FE-014 |
| 52 | [`GET /tickets/{ticketId}`](endpoints/12-tickets/52-GET-tickets-ticketId.md) | Autenticado (propietario) | HU-FE-014 |
| 53 | [`POST /tickets/{ticketId}/regenerate`](endpoints/12-tickets/53-POST-tickets-ticketId-regenerate.md) | Autenticado (propietario) | HU-FE-014, HU-FE-016 |
| 54 | [`POST /tickets/transfer`](endpoints/12-tickets/54-POST-tickets-transfer.md) | Autenticado | HU-FE-017 |
| 55 | [`GET /tickets/transfer/{transferId}`](endpoints/12-tickets/55-GET-tickets-transfer-transferId.md) | Remitente / destinatario | HU-FE-017 |
| 56 | [`POST /tickets/transfer/{transferId}/accept`](endpoints/12-tickets/56-POST-tickets-transfer-transferId-accept.md) | Público (token seguro) | HU-FE-017 |
| 57 | [`POST /tickets/validate`](endpoints/12-tickets/57-POST-tickets-validate.md) | COLLABORATOR | HU-FE-024 |

### Notificaciones
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 58 | [`POST /notifications/upcoming`](endpoints/13-notifications/58-POST-notifications-upcoming.md) | Autenticado | HU-FE-005 |
| 59 | [`GET /notifications`](endpoints/13-notifications/59-GET-notifications.md) | Autenticado | HU-FE-015 |
| 60 | [`GET /notifications/{notificationId}`](endpoints/13-notifications/60-GET-notifications-notificationId.md) | Autenticado | HU-FE-015 |
| 61 | [`PUT /notifications/preferences`](endpoints/13-notifications/61-PUT-notifications-preferences.md) | Autenticado | HU-FE-015 |
| 62 | [`POST /notifications/{notificationId}/resend`](endpoints/13-notifications/62-POST-notifications-notificationId-resend.md) | Autenticado | HU-FE-015 |

### Puntos y fidelización
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 63 | [`GET /points`](endpoints/14-points/63-GET-points.md) | Autenticado | HU-FE-023 |
| 64 | [`POST /points/redeem`](endpoints/14-points/64-POST-points-redeem.md) | Autenticado | HU-FE-023 |

### Bonos de regalo
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 65 | [`POST /giftcards`](endpoints/15-giftcards/65-POST-giftcards.md) | Autenticado | HU-FE-018 |
| 66 | [`GET /giftcards`](endpoints/15-giftcards/66-GET-giftcards.md) | Autenticado | HU-FE-018 |
| 67 | [`GET /giftcards/{code}`](endpoints/15-giftcards/67-GET-giftcards-code.md) | Público | HU-FE-018 |
| 68 | [`POST /giftcards/redeem`](endpoints/15-giftcards/68-POST-giftcards-redeem.md) | Autenticado | HU-FE-018 |

### Cine Flash
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 69 | [`GET /cineflash`](endpoints/69-GET-cineflash.md) | Público | HU-FE-019 |

### IA y recomendaciones
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 70 | [`POST /ai/chat`](endpoints/16-ai/70-POST-ai-chat.md) | Público (auth opcional) | HU-FE-021 |
| 71 | [`POST /ai/recommendations`](endpoints/16-ai/71-POST-ai-recommendations.md) | Público (auth opcional) | HU-FE-021 |
| 72 | [`GET /ai/history`](endpoints/16-ai/72-GET-ai-history.md) | Sesión / Autenticado | HU-FE-021 |
| 73 | [`GET /recommendations`](endpoints/17-recommendations/73-GET-recommendations.md) | Autenticado | HU-FE-022 |
| 74 | [`GET /recommendations/history`](endpoints/17-recommendations/74-GET-recommendations-history.md) | Autenticado | HU-FE-022 |
| 75 | [`PUT /recommendations/preferences`](endpoints/17-recommendations/75-PUT-recommendations-preferences.md) | Autenticado | HU-FE-022 |

### Encuestas
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 76 | [`POST /surveys`](endpoints/76-POST-surveys.md) | Autenticado | HU-FE-027 |

### PQRS
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 77 | [`POST /pqrs`](endpoints/18-pqrs/77-POST-pqrs.md) | Autenticado | HU-FE-028 |
| 78 | [`GET /pqrs`](endpoints/18-pqrs/78-GET-pqrs.md) | Autenticado | HU-FE-028 |
| 79 | [`GET /pqrs/{pqrId}`](endpoints/18-pqrs/79-GET-pqrs-pqrId.md) | Autenticado (propietario / staff) | HU-FE-028 |
| 80 | [`POST /pqrs/{pqrId}/comments`](endpoints/18-pqrs/80-POST-pqrs-pqrId-comments.md) | Autenticado (propietario / staff) | HU-FE-028 |

### Promociones y cupones
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 81 | [`GET /promotions`](endpoints/19-promotions/81-GET-promotions.md) | Público | HU-FE-029, HU-FE-026 |
| 82 | [`POST /promotions`](endpoints/19-promotions/82-POST-promotions.md) | ADMIN | HU-FE-026 |
| 83 | [`PUT /promotions/{promotionId}`](endpoints/19-promotions/83-PUT-promotions-promotionId.md) | ADMIN | HU-FE-026 |
| 84 | [`DELETE /promotions/{promotionId}`](endpoints/19-promotions/84-DELETE-promotions-promotionId.md) | ADMIN | HU-FE-026 |
| 85 | [`POST /coupons`](endpoints/19-promotions/85-POST-coupons.md) | ADMIN | HU-FE-026 |

### Dashboard
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 86 | [`GET /dashboard`](endpoints/86-GET-dashboard.md) | MANAGER | HU-FE-025 |

### Administración
| # | Endpoint | Auth | Historia de usuario |
|---|---|---|---|
| 87 | [`/api/v1/admin/*` — convenciones y catálogo de recursos](endpoints/87-GET-admin-conventions.md) | ADMIN | HU-FE-020 |

---

## Mapa Historia → Endpoints

| Historia de usuario | Endpoints usados (# catálogo) |
|---|---|
| **HU-FE-001** Configuración de la plataforma frontend | `#1` |
| **HU-FE-002** Selección de país, departamento y ciudad | `#2` `#3` `#4` `#5` |
| **HU-FE-003** Visualización de la cartelera semanal | `#6` `#88` `#89` `#90` |
| **HU-FE-004** Detalle de una película | `#9` `#10` `#11` |
| **HU-FE-005** Próximos estrenos | `#7` `#9` `#58` |
| **HU-FE-006** Registro de usuario | `#18` `#19` `#31` |
| **HU-FE-007** Inicio de sesión y autenticación segura | `#20` `#21` `#22` `#23` `#24` |
| **HU-FE-008** Perfil y beneficios de membresía | `#25` `#26` `#27` `#28` `#29` |
| **HU-FE-009** Selección de función y formato | `#10` `#12` `#13` |
| **HU-FE-010** Selección interactiva de sillas | `#14` `#15` `#16` `#17` |
| **HU-FE-011** Carrito de compras | `#32` `#33` `#34` `#35` `#39` `#40` |
| **HU-FE-012** Compra de productos de confitería | `#41` `#42` `#36` `#37` `#38` |
| **HU-FE-013** Proceso de pago seguro | `#43` `#44` `#45` |
| **HU-FE-014** Entradas digitales y factura | `#51` `#52` `#53` `#50` `#46` |
| **HU-FE-015** Notificaciones por correo | `#59` `#60` `#61` `#62` |
| **HU-FE-016** Cambio de función | `#46` `#47` `#48` `#49` `#53` |
| **HU-FE-017** Transferencia de entradas | `#54` `#55` `#56` |
| **HU-FE-018** Bonos de regalo digitales | `#65` `#66` `#67` `#68` |
| **HU-FE-019** Cine Flash | `#69` `#8` |
| **HU-FE-020** Panel administrativo | `#87` |
| **HU-FE-021** Chatbot de recomendación | `#70` `#71` `#72` |
| **HU-FE-022** Recomendaciones personalizadas | `#73` `#74` `#75` |
| **HU-FE-023** Programa de fidelización y puntos | `#63` `#64` `#30` |
| **HU-FE-024** Escaneo y validación de QR | `#57` |
| **HU-FE-025** Dashboard gerencial | `#86` |
| **HU-FE-026** Administración de promociones y cupones | `#82` `#83` `#84` `#85` `#81` |
| **HU-FE-027** Encuestas de satisfacción | `#76` |
| **HU-FE-028** PQRS | `#77` `#78` `#79` `#80` |
| **HU-FE-029** Consumo de API pública | Todos los endpoints; explícitos: `#1` `#6` `#9` `#12` `#20` `#18` `#25` `#45` `#47` `#81` `#28` |

> **Reconciliación con el backlog.** Varias rutas listadas en el backlog se rediseñaron para mantener
> consistencia REST (por el mandato del arquitecto: nomenclatura RESTful, sin endpoints redundantes,
> reutilizar los existentes). Cada documento de endpoint anota su alias del backlog en **Historia de
> usuario relacionada**. Mapeos clave:
>
> - `GET /movies/weekly`, `GET /movies/today`, `GET /movies/filter` → expuestos por el backend como
>   endpoints propios `#88`, `#89`, `#90` (confirmados en la colección Postman compartida)
> - `GET /movies/upcoming/{id}` → `#9 GET /movies/{movieId}` (los próximos estrenos son películas)
> - `GET /countries/{countryId}/departments` → `#3 GET /departments/{countryId}` (ruta del backend)
> - `GET /departments/{departmentId}/cities` → `#4 GET /cities/{departmentId}` (ruta del backend)
> - `POST /reservations/lock-seats` → `#15 POST /functions/{functionId}/seat-holds`
> - `DELETE /reservations/release-seats` → `#16 DELETE /functions/{functionId}/seat-holds/{holdId}`
> - `GET /payments/status` → `#44 GET /payments/{paymentId}`
> - `GET /reservations`, `GET /reservations/{id}` (HU-FE-016) → `#46 GET /orders`, `#47 GET /orders/{orderId}`
> - `GET /invoice/{id}` → `#50 GET /orders/{orderId}/invoice`
> - `POST /tickets/regenerate` → `#53 POST /tickets/{ticketId}/regenerate`
> - `GET /tickets/transfer/status` → `#55 GET /tickets/transfer/{transferId}`
> - `POST /tickets/transfer/accept` → `#56 POST /tickets/transfer/{transferId}/accept`
> - `GET /notifications/history` → `#59 GET /notifications`
> - `POST /notifications/email`, `POST /notifications/resend` → `#62 POST /notifications/{id}/resend`
> - `PUT /reservations/change` → `#49 POST /orders/{orderId}/change-function`
> - `PUT /promotions`, `DELETE /promotions` → por item `#83 PUT /promotions/{id}`, `#84 DELETE /promotions/{id}`
> - `POST /recommendations/preferences` → `#75 PUT /recommendations/preferences`
> - `POST /ai/history` → `#72 GET /ai/history` (el historial es lectura)
> - `PUT /pqrs` → `#80 POST /pqrs/{pqrId}/comments`
> - `POST /membership/create` → `#31 POST /memberships`

## Nota de cobertura

El **panel administrativo** (HU-FE-020) abarca ~20 módulos de CRUD completo. En lugar de un archivo
por recurso admin, un único [catálogo de convenciones y recursos admin](endpoints/87-GET-admin-conventions.md)
(`#87`) define el patrón CRUD uniforme (verbos, query params, envelopes de error/paginación,
permisos), más una tabla de recursos y ejemplos desarrollados completos para dos recursos
emblemáticos. Extiéndelo con detalles por módulo conforme los módulos se implementen.
