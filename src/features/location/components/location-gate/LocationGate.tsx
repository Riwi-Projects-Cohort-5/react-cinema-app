import { useEffect, useRef } from "react";

import { LocationWizardModal } from "@features/location/components/location-wizard/LocationWizardModal";
import { useLocationStore } from "@features/location/store";

// Abre el asistente automáticamente en la primera visita (cuando no hay ubicación guardada).
// El chequeo corre una sola vez: si el visitante cierra el modal sin elegir, no se reabre solo.
export function LocationGate() {
  const location = useLocationStore((state) => state.location);
  const isWizardOpen = useLocationStore((state) => state.isWizardOpen);
  const openWizard = useLocationStore((state) => state.openWizard);
  const closeWizard = useLocationStore((state) => state.closeWizard);
  const setLocation = useLocationStore((state) => state.setLocation);

  const hasCheckedFirstVisit = useRef(false);

  useEffect(() => {
    if (hasCheckedFirstVisit.current) return;
    hasCheckedFirstVisit.current = true;

    if (!useLocationStore.getState().location) {
      openWizard();
    }
  }, [openWizard]);

  return (
    <LocationWizardModal
      key={isWizardOpen ? "open" : "closed"}
      isOpen={isWizardOpen}
      onClose={closeWizard}
      onConfirm={setLocation}
      initialLocation={location}
    />
  );
}
