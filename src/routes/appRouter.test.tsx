import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRouter } from "@/test/helpers/renderRouter";
import { PATHS } from "@routes/paths";
import { useSessionStore } from "@services/session";

describe("appRouter", () => {
  it("renders the home page at the root path", () => {
    renderRouter(PATHS.home);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
  });

  it("renders the login page when unauthenticated", () => {
    renderRouter(PATHS.auth.login);

    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("redirects unauthenticated users from a private route to login", () => {
    useSessionStore.setState({ accessToken: null });

    const router = renderRouter(PATHS.profile);

    expect(router.state.location.pathname).toBe(PATHS.auth.login);
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders a private route when the user is authenticated", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderRouter(PATHS.purchaseHistory);

    expect(router.state.location.pathname).toBe(PATHS.purchaseHistory);
    expect(screen.getByRole("heading", { name: "Purchase History" })).toBeInTheDocument();
  });

  it("redirects authenticated users away from public-only routes", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderRouter(PATHS.auth.register);

    expect(router.state.location.pathname).toBe(PATHS.home);
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
  });

  it("renders the 404 page for unknown paths", () => {
    renderRouter("/unknown-route");

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });
});
