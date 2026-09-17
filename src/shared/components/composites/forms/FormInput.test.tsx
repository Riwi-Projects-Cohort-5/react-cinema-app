import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "./FormField";
import { FormInput } from "./FormInput";

describe("FormInput", () => {
  it("reads the label and error from FormField context", () => {
    render(
      <FormField id="email" label="Correo" error="El correo es obligatorio" required>
        <FormInput name="email" />
      </FormField>
    );

    expect(screen.getByRole("textbox", { name: /correo/i })).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
  });
});
