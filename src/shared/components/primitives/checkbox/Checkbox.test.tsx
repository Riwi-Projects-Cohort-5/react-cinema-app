import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checkbox, CheckboxRobot } from "./Checkbox";

describe.each([
  { name: "Checkbox", Component: Checkbox },
  { name: "CheckboxRobot", Component: CheckboxRobot },
])("$name", ({ Component }) => {
  it("toggles by click when uncontrolled", () => {
    render(<Component />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("toggles by Space key", () => {
    render(<Component />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.keyDown(checkbox, { key: " " });

    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("toggles by Enter key", () => {
    render(<Component defaultChecked />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.keyDown(checkbox, { key: "Enter" });

    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with the new value when controlled", () => {
    const onChange = vi.fn();
    render(<Component checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", () => {
    render(<Component disabled />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    fireEvent.keyDown(checkbox, { key: " " });
    fireEvent.keyDown(checkbox, { key: "Enter" });

    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(checkbox).toHaveAttribute("aria-disabled", "true");
    expect(checkbox).toHaveAttribute("tabindex", "-1");
  });

  it("does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<Component checked={false} onChange={onChange} disabled />);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: " " });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("exposes an accessible name via aria-label", () => {
    render(<Component ariaLabel="Acepto los términos" />);

    expect(screen.getByRole("checkbox", { name: "Acepto los términos" })).toBeInTheDocument();
  });

  it("exposes an accessible name via aria-labelledby", () => {
    render(
      <>
        <span id="lbl-terminos">Acepto los términos y condiciones</span>
        <Component ariaLabelledBy="lbl-terminos" />
      </>
    );

    expect(
      screen.getByRole("checkbox", { name: "Acepto los términos y condiciones" })
    ).toBeInTheDocument();
  });
});
