import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider, type DataRouter } from "react-router";
import { render } from "@testing-library/react";

import { appRoutes } from "@routes/appRouter";

export function renderRouter(initialPath: string): DataRouter {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const router = createMemoryRouter(appRoutes, { initialEntries: [initialPath] });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

