import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRouter } from "@/test/helpers/renderRouter";
import { PATHS } from "@routes/paths";
import { useSessionStore } from "@services/session";

describe("appRouter", () => {
  it("renders the home page at the root path", () => {
    renderRouter(PATHS.home);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
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

  it("renders the authenticated layout for private routes", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    renderRouter(PATHS.profile);

    expect(screen.getByRole("link", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Historial de compras" })).toBeInTheDocument();
  });

  it("renders the admin layout when the user is authenticated", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderRouter(PATHS.admin.dashboard);

    expect(router.state.location.pathname).toBe(PATHS.admin.dashboard);
    expect(screen.getByRole("link", { name: "Multicine Admin" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Admin Dashboard" })).toBeInTheDocument();
  });

  it("redirects authenticated users away from public-only routes", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderRouter(PATHS.auth.register);

    expect(router.state.location.pathname).toBe(PATHS.home);
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
  });

  it("renders the 404 page for unknown paths", () => {
    renderRouter("/unknown-route");

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
  });

  it("renders the general error page at the error path", () => {
    renderRouter(PATHS.error);

    expect(screen.getByRole("heading", { name: "Algo salió mal" })).toBeInTheDocument();
  });
});
