import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";

import { HealthStatus } from "@features/health/components/HealthStatus";
import { LocationGate } from "@features/location/components/location-gate/LocationGate";
import { appRouter } from "@routes/appRouter";
import { queryClient } from "@services/queryClient";
import { AppToaster } from "@shared/components/composites";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HealthStatus />
      <RouterProvider router={appRouter} />
      <LocationGate router={appRouter} />
      <AppToaster />
    </QueryClientProvider>
  );
}

export default App;
