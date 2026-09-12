import { describe, expect, it } from "vitest";

import { formatDuration } from "./index";

describe("formatDuration", () => {
  it("formats 0 minutes correctly", () => {
    expect(formatDuration(0)).toBe("0h 0min");
  });

  it("formats 1 minute correctly", () => {
    expect(formatDuration(1)).toBe("0h 1min");
  });

  it("formats 45 minutes correctly", () => {
    expect(formatDuration(45)).toBe("0h 45min");
  });

  it("formats 59 minutes correctly as edge case", () => {
    expect(formatDuration(59)).toBe("0h 59min");
  });

  it("formats 60 minutes correctly", () => {
    expect(formatDuration(60)).toBe("1h 0min");
  });

  it("formats 88 minutes rounded to nearest 5 min", () => {
    expect(formatDuration(88)).toBe("1h 30min");
  });

  it("formats 148 minutes rounded to nearest 5 min", () => {
    expect(formatDuration(148)).toBe("2h 30min");
  });

  it("formats 195 minutes correctly", () => {
    expect(formatDuration(195)).toBe("3h 15min");
  });
});
