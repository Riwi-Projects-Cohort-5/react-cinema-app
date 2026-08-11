import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import type { JSX } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { AdminLayout, AuthenticatedLayout, PublicLayout } from "@layouts";
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
  it("PublicLayout renders the public nav and the outlet", () => {
    renderLayout(PublicLayout, PATHS.home);

    expect(screen.getByRole("link", { name: "Multicine" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrarse" })).toBeInTheDocument();
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
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
