import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { afterEach, describe, expect, it, vi } from "vitest";

import { Flashbar } from "./Flashbar";

describe("Flashbar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders title, message and a live countdown", () => {
    vi.useFakeTimers();

    render(
      <Flashbar title="Cine Flash" message="Hasta 20% de descuento" countdownSeconds={16381} />
    );

    expect(screen.getByRole("status", { name: "Cine Flash" })).toBeInTheDocument();
    expect(screen.getByText("Hasta 20% de descuento")).toBeInTheDocument();
    expect(screen.getByText("04:33:01")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("04:33:00")).toBeInTheDocument();
  });

  it("renders the action and fires onClick", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <Flashbar
        title="Título"
        message="Mensaje"
        actionLabel="Ver funciones"
        onAction={onAction}
        fixed={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "Ver funciones" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders a close button and fires onDismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(<Flashbar title="Título" message="Mensaje" onDismiss={onDismiss} fixed={false} />);

    await user.click(screen.getByRole("button", { name: "Cerrar aviso" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("uses role alert for the error tone", () => {
    render(<Flashbar title="Título" message="Mensaje" tone="error" fixed={false} />);

    expect(screen.getByRole("alert", { name: "Título" })).toBeInTheDocument();
  });
});
