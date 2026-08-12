import { createMemoryRouter, RouterProvider } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PublicOnlyRoute } from "@routes/guards/PublicOnlyRoute";
import { PATHS } from "@routes/paths";
import { PlaceholderPage } from "@shared/components/PlaceholderPage";
import { useSessionStore } from "@services/session";

function renderPublicRoutes(initialPath: string): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        element: <PublicOnlyRoute />,
        children: [{ path: PATHS.auth.login, element: <PlaceholderPage title="Login" /> }],
      },
      { path: PATHS.home, element: <PlaceholderPage title="Home" /> },
    ],
    { initialEntries: [initialPath] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("PublicOnlyRoute", () => {
  it("renders the outlet when the user is not authenticated", () => {
    useSessionStore.setState({ accessToken: null });

    renderPublicRoutes(PATHS.auth.login);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("redirects to the home page when the user is authenticated", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderPublicRoutes(PATHS.auth.login);

    expect(router.state.location.pathname).toBe(PATHS.home);
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
  });
});
