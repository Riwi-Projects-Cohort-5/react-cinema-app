import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { DataRouter } from "react-router";

import { LocationWizardModal } from "@features/location/components/location-wizard/LocationWizardModal";
import { useLocationStore } from "@features/location/store";
import { PATHS } from "@routes/paths";

// En las rutas de autenticación el modal bloquearía el formulario, así que la apertura automática
// espera a que el visitante llegue a otra ruta. Se deriva de PATHS.auth para cubrir las rutas nuevas.
const AUTH_PATHS: readonly string[] = Object.values(PATHS.auth);

function isAuthRoute(pathname: string): boolean {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

interface LocationGateProps {
  // El gate vive fuera del RouterProvider (App.tsx), por eso recibe el router en vez de usar useLocation.
  router: Pick<DataRouter, "state" | "subscribe">;
}

// Abre el asistente automáticamente en la primera visita (cuando no hay ubicación guardada).
// El chequeo corre una sola vez, en la primera ruta que no sea de autenticación: si el visitante
// cierra el modal sin elegir, no se reabre solo.
export function LocationGate({ router }: LocationGateProps) {
  const location = useLocationStore((state) => state.location);
  const isWizardOpen = useLocationStore((state) => state.isWizardOpen);
  const openWizard = useLocationStore((state) => state.openWizard);
  const closeWizard = useLocationStore((state) => state.closeWizard);
  const setLocation = useLocationStore((state) => state.setLocation);

  const subscribe = useCallback((onChange: () => void) => router.subscribe(onChange), [router]);
  const pathname = useSyncExternalStore(subscribe, () => router.state.location.pathname);

  const hasCheckedFirstVisit = useRef(false);

  useEffect(() => {
    if (hasCheckedFirstVisit.current || isAuthRoute(pathname)) return;
    hasCheckedFirstVisit.current = true;

    if (!useLocationStore.getState().location) {
      openWizard();
    }
  }, [pathname, openWizard]);

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
