import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import { describe, expect, it, vi } from "vitest";

import { IconLink } from "./IconLink";

describe("IconLink", () => {
  it("renders an anchor when `to` is provided", () => {
    render(
      <MemoryRouter>
        <IconLink to="/funciones">Ver funciones</IconLink>
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Ver funciones" })).toHaveAttribute(
      "href",
      "/funciones"
    );
  });

  it("renders a button and fires onClick otherwise", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<IconLink onClick={onClick}>Ver funciones</IconLink>);

    await user.click(screen.getByRole("button", { name: "Ver funciones" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
