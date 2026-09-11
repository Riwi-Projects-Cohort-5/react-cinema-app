import { render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { AdminLayout, AuthenticatedLayout, MainLayout } from "@layouts";
import { PATHS } from "@routes/paths";

function renderLayout(Layout: () => JSX.Element, path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [{ path, element: <p>Outlet content</p> }],
      },
    ],
    { initialEntries: [path] }
  );

  render(<RouterProvider router={router} />);
}

describe("layouts", () => {
  it("MainLayout renders the shared Header, CentralNav, outlet, and Footer", () => {
    renderLayout(MainLayout, PATHS.home);

    // Header (shared composite) — Register and Login buttons
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();

    // CentralNav — "Salas y Cines" is the unique link (Cartelera and Próximos
    // estrenos also appear in the Footer, so avoid ambiguous name matchers)
    expect(screen.getByRole("link", { name: "Salas y Cines" })).toBeInTheDocument();

    // Outlet
    expect(screen.getByText("Outlet content")).toBeInTheDocument();

    // Footer — "Navegación" heading is unique to the Footer
    expect(
      screen.getByRole("heading", { name: "Navegación" })
    ).toBeInTheDocument();
  });

  it("AuthenticatedLayout renders the authenticated nav and the outlet", () => {
    renderLayout(AuthenticatedLayout, PATHS.profile);

    expect(screen.getByRole("link", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Historial de compras" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Checkout" })).toBeInTheDocument();
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
  });

  it("AdminLayout renders the admin sidebar and the outlet", () => {
    renderLayout(AdminLayout, PATHS.admin.dashboard);

    expect(screen.getByRole("link", { name: "Multicine Admin" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
  });
});
