import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";

import { appRouter } from "@routes/appRouter";
import { HealthStatus } from "@features/health/components/HealthStatus";
import { queryClient } from "@services/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HealthStatus />
      <RouterProvider router={appRouter} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
