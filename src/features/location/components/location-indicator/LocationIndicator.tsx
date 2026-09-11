import { CaretDown, MapPin } from "@phosphor-icons/react";

import { useLocationStore } from "@features/location/store";

// Punto de entrada desde el Header para cambiar de ciudad sin recargar la página.
export function LocationIndicator() {
  const location = useLocationStore((state) => state.location);
  const openWizard = useLocationStore((state) => state.openWizard);

  return (
    <button
      type="button"
      onClick={openWizard}
      aria-label={
        location ? `Ubicación actual: ${location.city.name}. Cambiar ubicación` : "Elegir ubicación"
      }
      className="flex items-center gap-2 rounded-full bg-surface-variant px-4 py-2 text-caption text-text-primary outline outline-offset-[-1px] outline-border transition-colors duration-fast hover:bg-surface-variant/80"
    >
      <MapPin size={18} weight="fill" aria-hidden="true" className="shrink-0 text-primary" />
      {location ? location.city.name : "Elegir ubicación"}
      <CaretDown size={12} aria-hidden="true" className="shrink-0" />
    </button>
  );
}
