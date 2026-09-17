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

  it("associates aria-describedby with a real error message element", () => {
    render(
      <Input
        label="Correo"
        state="error"
        errorMessage="El correo es obligatorio"
        helperText="Te enviaremos un correo de confirmación"
        aria-describedby="helper-text"
      />
    );

    const input = screen.getByRole("textbox", { name: /correo/i });
    const errorMessage = screen.getByText("El correo es obligatorio");
    const helperMessage = screen.getByText("Te enviaremos un correo de confirmación");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(errorMessage).toHaveAttribute("id");
    expect(helperMessage).toHaveAttribute("id");
    expect(document.getElementById(errorMessage.getAttribute("id") ?? "")).toBe(errorMessage);
    expect(document.getElementById(helperMessage.getAttribute("id") ?? "")).toBe(helperMessage);
    expect(input.getAttribute("aria-describedby") ?? "").toContain(
      errorMessage.getAttribute("id") ?? ""
    );
    expect(input.getAttribute("aria-describedby") ?? "").toContain(
      helperMessage.getAttribute("id") ?? ""
    );
    expect(input.getAttribute("aria-describedby") ?? "").toContain("helper-text");
  });
});
