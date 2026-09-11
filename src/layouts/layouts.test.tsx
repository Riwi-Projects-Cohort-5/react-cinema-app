import { fireEvent, render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AdminLayout, AuthenticatedLayout, PublicLayout } from "@layouts";
import { PATHS } from "@routes/paths";
import { THEME_STORAGE_KEY } from "@shared/hooks/useTheme";

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
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("PublicLayout renders the public nav, theme toggle, and the outlet", () => {
    renderLayout(PublicLayout, PATHS.home);

    expect(screen.getByRole("link", { name: "Multicine" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrarse" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cambiar a modo claro" })
    ).toBeInTheDocument();
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("w-full", "flex-1");
    expect(screen.getByRole("main")).not.toHaveClass("max-w-6xl");
  });

  it("PublicLayout renders constrained main and theme toggle for non-home routes", () => {
    renderLayout(PublicLayout, "/some-other-path");

    expect(screen.getByRole("main")).toHaveClass("mx-auto", "w-full", "max-w-6xl", "flex-1", "px-4", "py-8");
    expect(
      screen.getByRole("button", { name: "Cambiar a modo claro" })
    ).toBeInTheDocument();
  });

  it("PublicLayout theme toggle button changes theme and attributes on click and keyboard activation", () => {
    renderLayout(PublicLayout, PATHS.home);

    const toggleBtn = screen.getByRole("button", { name: "Cambiar a modo claro" });
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.theme).toBeUndefined();

    fireEvent.click(toggleBtn);

    expect(screen.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");
    expect(toggleBtn).toHaveAttribute("aria-label", "Cambiar a modo oscuro");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    fireEvent.click(toggleBtn);

    expect(screen.getByRole("button", { name: "Cambiar a modo claro" })).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
    expect(toggleBtn).toHaveAttribute("aria-label", "Cambiar a modo claro");
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("PublicLayout initializes theme toggle in light mode when stored in localStorage", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    renderLayout(PublicLayout, PATHS.home);

    const toggleBtn = screen.getByRole("button", { name: "Cambiar a modo oscuro" });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");
    expect(toggleBtn).toHaveAttribute("aria-label", "Cambiar a modo oscuro");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("AuthenticatedLayout renders the authenticated nav and the outlet", () => {
    renderLayout(PublicLayout, PATHS.home);

    expect(screen.getByRole("link", { name: "Multicine" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrarse" })).toBeInTheDocument();
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("w-full", "flex-1");
    expect(screen.getByRole("main")).not.toHaveClass("max-w-6xl");
  });

  it("PublicLayout renders constrained main for non-home routes", () => {
    renderLayout(PublicLayout, "/some-other-path");

    expect(screen.getByRole("main")).toHaveClass("mx-auto", "w-full", "max-w-6xl", "flex-1", "px-4", "py-8");
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
