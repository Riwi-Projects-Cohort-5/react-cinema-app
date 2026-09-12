import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { describe, expect, it, vi } from "vitest";

import { CineFlashBanner } from "./CineFlashBanner";

describe("CineFlashBanner", () => {
  it("renders the promo banner with the configured message and countdown", () => {
    render(<CineFlashBanner />);

    expect(screen.getByRole("status", { name: "Cine Flash" })).toBeInTheDocument();
    expect(
      screen.getByText("Hasta 20% de descuento en funciones seleccionadas")
    ).toBeInTheDocument();
    expect(screen.getByText("05:00:00")).toBeInTheDocument();
  });

  it("renders the action button and triggers the action callback", async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    render(<CineFlashBanner />);

    await user.click(screen.getByRole("button", { name: "Ver funciones" }));

    expect(logSpy).toHaveBeenCalledWith("Ver funciones");
    logSpy.mockRestore();
  });
});
