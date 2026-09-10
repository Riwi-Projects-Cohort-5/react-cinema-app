import { NavLink } from 'react-router';
import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react";
import { Button, Dropdown } from "@shared/components/";
import { cn } from "@shared/utils/cn";

const locationOptions = [
  { value: "Barranquilla", label: "Barranquilla" },
  { value: "Bogota", label: "Bogotá" },
  { value: "Medellin", label: "Medellín" },
  { value: "Cali", label: "Cali" },
];

export default function CentralNav() {
  return (
    <div className="relative flex items-center justify-end bg-divider rounded-2xl p-1.5 border border-gray-800/80 mx-4">
      {/* NavLinks centrados en el contenedor */}
      <ul className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-4">
        <li>
          <NavLink to="/catalog" className="text-sm transition hover:text-white">
            Cartelera
          </NavLink>
        </li>

        <li>
          <NavLink to="/premieres" className="text-sm transition hover:text-white">
            Próximos estrenos
          </NavLink>
        </li>

        <li>
          <NavLink to="/promotions" className="text-sm transition hover:text-white">
            Promociones
          </NavLink>
        </li>

        <li>
          <NavLink to="/cinemas" className="text-sm transition hover:text-white">
            Salas y Cines
          </NavLink>
        </li>
      </ul>

      <div className="flex items-center gap-2">
        

        <Dropdown
          options={locationOptions}
          defaultValue="Barranquilla"
          triggerIcon={<MapPinIcon size={18} weight="fill" className="text-primary" />}
          triggerClassName={cn(
            "h-auto w-auto gap-2 rounded-full bg-surface-variant px-4 py-2 text-sm",
            "border-transparent outline outline-1 outline-offset-[-1px] outline-border",
          )}
        />
        <Button
          variant="secondary"
          size="sm"
          radius="full"
          aria-label="Buscar"
          className={cn("bg-surface-variant text-text-primary  outline-2 outline-offset outline-border hover:bg-surface-variant/80")}
        >
          <MagnifyingGlassIcon size={18} />
        </Button>
      </div>
    </div>
  );
}