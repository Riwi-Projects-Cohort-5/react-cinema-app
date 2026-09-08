# useCineFlash

Hook sobre TanStack Query para consultar `GET /cineflash` (servicio `getCineFlash`).

## Configuración de la query

| Opción                 | Valor                   | Nota                                                      |
| ---------------------- | ----------------------- | --------------------------------------------------------- |
| `queryKey`             | `["cineflash", cityId]` | Incluye la ciudad para diferenciar consultas.             |
| `enabled`              | `Boolean(cityId)`       | Sin `cityId` la query no corre; el `queryFn` lanza error. |
| `staleTime`            | 30 s                    | Reuso dentro de la sesión.                                |
| `refetchInterval`      | 60 s                    | Mantiene viva la cuenta regresiva.                        |
| `refetchOnWindowFocus` | `true`                  | Refresca al volver a la pestaña.                          |

## Ejemplo

```tsx
import { useCineFlash } from "@features/flashbar/hooks/useCineFlash";

const { data, isPending, isError } = useCineFlash(cityId);
```
