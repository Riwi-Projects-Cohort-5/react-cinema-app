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

  it("renders the contact step with unique email fields and the expected wizard flow", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/¿cómo te contactamos\?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/celular/i)).toBeInTheDocument();
    expect(document.querySelectorAll('input[name="email"]').length).toBe(1);
    expect(document.querySelectorAll('input[name="confirmEmail"]').length).toBe(1);
  });
});
