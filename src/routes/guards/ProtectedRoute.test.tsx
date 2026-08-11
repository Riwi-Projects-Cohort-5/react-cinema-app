import { createMemoryRouter, RouterProvider } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProtectedRoute } from "@routes/guards/ProtectedRoute";
import { PATHS } from "@routes/paths";
import { PlaceholderPage } from "@shared/components/PlaceholderPage";
import { useSessionStore } from "@services/session";

function renderProtectedRoutes(initialPath: string): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [{ path: PATHS.profile, element: <PlaceholderPage title="Profile" /> }],
      },
      { path: PATHS.auth.login, element: <PlaceholderPage title="Login" /> },
    ],
    { initialEntries: [initialPath] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("ProtectedRoute", () => {
  it("renders the outlet when the user is authenticated", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    renderProtectedRoutes(PATHS.profile);

    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
  });

  it("redirects to the login page when the user is not authenticated", () => {
    useSessionStore.setState({ accessToken: null });

    const router = renderProtectedRoutes(PATHS.profile);

    expect(router.state.location.pathname).toBe(PATHS.auth.login);
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("preserves the origin location in the redirect state", () => {
    useSessionStore.setState({ accessToken: null });

    const router = renderProtectedRoutes(PATHS.profile);

    const state = router.state.location.state as { from?: { pathname?: string } };
    expect(state.from?.pathname).toBe(PATHS.profile);
  });
});
