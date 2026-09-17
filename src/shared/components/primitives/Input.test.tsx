import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Input from "./Input";

describe("Input", () => {
  it("renders a text input and creates an id when none is provided", () => {
    render(<Input label="Correo" />);

    const input = screen.getByRole("textbox", { name: /correo/i });
    expect(input).toHaveAttribute("id", expect.stringContaining("input-"));
  });

  it("renders the textarea variant when requested", () => {
    render(<Input type="textarea" label="Mensaje" />);

    expect(screen.getByRole("textbox", { name: /mensaje/i })).toHaveAttribute("rows", "4");
  });

  it("propagates aria attributes and error state to the native element", () => {
    render(
      <Input
        label="Correo"
        state="error"
        errorMessage="El correo es obligatorio"
        aria-describedby="helper-text"
      />
    );

    const input = screen.getByRole("textbox", { name: /correo/i });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby") ?? "").toContain("helper-text");
    expect(input.getAttribute("aria-describedby") ?? "").toContain("-error");
  });
});
