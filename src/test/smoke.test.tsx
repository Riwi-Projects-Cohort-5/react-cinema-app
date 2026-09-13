import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { env } from "@config/env";
import { PATHS } from "@routes/paths";
import { clearSession, getAccessToken, useSessionStore } from "@services/session";
import { PlaceholderPage } from "@shared/components/PlaceholderPage";
import { RegisterPage } from "@features/auth/pages/register/pages/RegisterPage";

describe("base platform smoke tests", () => {
  it("loads the environment configuration with defaults", () => {
    expect(env.apiBaseUrl).toBe("/api/v1");
    expect(env.apiTimeoutMs).toBe(15000);
  });

  it("defines the expected route paths", () => {
    expect(PATHS.auth.login).toBe("/auth/login");
    expect(PATHS.auth.register).toBe("/auth/register");
    expect(PATHS.profile).toBe("/profile");
    expect(PATHS.purchaseHistory).toBe("/purchase-history");
    expect(PATHS.checkout).toBe("/checkout");
  });

  it("manages the session store through its helpers", () => {
    expect(getAccessToken()).toBeNull();

    useSessionStore.getState().setAccessToken("token-123");
    expect(getAccessToken()).toBe("token-123");

    clearSession();
    expect(getAccessToken()).toBeNull();
  });

  it("renders a shared component", () => {
    render(<PlaceholderPage title="Home" />);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
  });

  it("starts on the personal step and renders its fields before the contact step", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/cuéntanos sobre ti/i)).toBeInTheDocument();
    expect(screen.getByText(/paso\s*1\s*de\s*4/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellidos \*/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/correo electrónico/i)).not.toBeInTheDocument();
  });
});
