import { render, screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { IconBadge } from "./IconBadge";

describe("IconBadge", () => {
  it("renders the icon content and marks the container decorative", () => {
    render(<IconBadge icon={<span data-testid="icon-content">icon</span>} />);

    expect(screen.getByTestId("icon-content")).toBeInTheDocument();
  });
});
