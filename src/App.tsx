import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";

import { CineFlashBanner } from "@features/flashbar/components/cineflash-banner/CineFlashBanner";
import { HealthStatus } from "@features/health/components/HealthStatus";
import { appRouter } from "@routes/appRouter";
import { queryClient } from "@services/queryClient";
import { AppToaster } from "@shared/components/composites";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HealthStatus />
      <CineFlashBanner />
      <RouterProvider router={appRouter} />
      <AppToaster />
    </QueryClientProvider>
  );
}

export default App;
