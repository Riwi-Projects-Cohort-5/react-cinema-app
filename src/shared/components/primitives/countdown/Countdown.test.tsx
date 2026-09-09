import { act, render, screen } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Countdown } from "./Countdown";

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the formatted time and ticks every second", () => {
    render(<Countdown seconds={3661} />);

    expect(screen.getByText("01:01:01")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("01:01:00")).toBeInTheDocument();
  });
});
