# CineFlashBanner

Contenedor de la feature que conecta `GET /cineflash` (hook `useCineFlash`) con el `Flashbar`. No renderiza nada mientras carga, ante error o cuando `active` es `false` (nunca un banner vacío). Al expirar la cuenta regresiva invalida `["cineflash"]` y `["movies", "cineflash"]`.

Pendiente: ciudad real (hoy usa `CINE_FLASH_DEFAULT_CITY_ID` en `config.ts`).
