import { createMemoryRouter, RouterProvider, type DataRouter } from "react-router";
import { render } from "@testing-library/react";

import { appRoutes } from "@routes/appRouter";

export function renderRouter(initialPath: string): DataRouter {
  const router = createMemoryRouter(appRoutes, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);
  return router;
}
