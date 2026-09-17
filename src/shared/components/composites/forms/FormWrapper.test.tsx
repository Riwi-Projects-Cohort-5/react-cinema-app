import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { FormWrapper } from "./FormWrapper";

describe("FormWrapper", () => {
  it("submits valid data through the form context", async () => {
    const onSubmit = vi.fn();
    const schema = z.object({
      email: z.string().email("Correo inválido"),
    });

    render(
      <FormWrapper schema={schema} onSubmit={onSubmit} initialValues={{ email: "user@test.com" }}>
        {({ register }) => (
          <>
            <input aria-label="Correo" {...register("email", schema.shape.email)} />
            <button type="submit">Enviar</button>
          </>
        )}
      </FormWrapper>
    );

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({ email: "user@test.com" });
    });
  });

  it("keeps form errors when validation fails", async () => {
    const onSubmit = vi.fn();
    const schema = z.object({
      email: z.string().email("Correo inválido"),
    });

    render(
      <FormWrapper schema={schema} onSubmit={onSubmit}>
        {({ register, errors }) => (
          <>
            <input aria-label="Correo" {...register("email", schema.shape.email)} />
            <button type="submit">Enviar</button>
            {errors.email ? <p>{errors.email}</p> : null}
          </>
        )}
      </FormWrapper>
    );

    fireEvent.change(screen.getByRole("textbox", { name: /correo/i }), {
      target: { value: "correo-invalido" },
    });
    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    expect(await screen.findByText("Correo inválido")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
