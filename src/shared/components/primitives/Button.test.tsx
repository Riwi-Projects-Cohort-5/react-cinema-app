import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Button from "./Button";

describe("Button", () => {
  it("renders its content and fires the click handler", () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Continuar</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables interactive behavior when state is disabled", () => {
    const onClick = vi.fn();

    render(
      <Button state="disabled" onClick={onClick}>
        Guardado
      </Button>
    );

    const button = screen.getByRole("button", { name: "Guardado" });

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
