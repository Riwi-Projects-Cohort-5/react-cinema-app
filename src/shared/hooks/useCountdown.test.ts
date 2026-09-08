import { act, renderHook } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatHms, useCountdown } from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats seconds as HH:MM:SS", () => {
    expect(formatHms(16381)).toBe("04:33:01");
    expect(formatHms(3600)).toBe("01:00:00");
    expect(formatHms(0)).toBe("00:00:00");
    expect(formatHms(-5)).toBe("00:00:00");
  });

  it("ticks down every second", () => {
    const { result } = renderHook(() => useCountdown(5));

    expect(result.current.formatted).toBe("00:00:05");

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.formatted).toBe("00:00:03");
  });

  it("clamps at zero and calls onExpire once", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown(2, { onExpire }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.formatted).toBe("00:00:00");
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
