import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";

import { appRouter } from "@/appRouter";
import { HealthStatus } from "@features/health/components/HealthStatus";
import { queryClient } from "@services/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HealthStatus />
      <RouterProvider router={appRouter} />
    </QueryClientProvider>
  );
}

export default App
