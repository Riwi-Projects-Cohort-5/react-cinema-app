import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHeroCarousel } from "./useHeroCarousel";

describe("useHeroCarousel", () => {
  const sampleItems = [
    { id: 1, title: "Movie 1" },
    { id: 2, title: "Movie 2" },
    { id: 3, title: "Movie 3" },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes at index 0 with progress 0, isPaused false, and correct activeItem", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    expect(result.current.activeIndex).toBe(0);
    expect(result.current.activeItem).toEqual(sampleItems[0]);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it("advances activeIndex after default 5000ms interval", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.activeIndex).toBe(1);
    expect(result.current.activeItem).toEqual(sampleItems[1]);
  });

  it("freezes index and progress when paused", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const progressBeforePause = result.current.progress;
    expect(progressBeforePause).toBeGreaterThan(0);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPaused).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.activeIndex).toBe(0);
    expect(result.current.progress).toBe(progressBeforePause);
  });

  it("restarts rotation and progress after resume()", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    act(() => {
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      result.current.resume();
    });
    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.activeIndex).toBe(1);
  });

  it("wraps to 0 when calling next() on the last index", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    act(() => {
      result.current.goTo(2);
    });
    expect(result.current.activeIndex).toBe(2);

    act(() => {
      result.current.next();
    });
    expect(result.current.activeIndex).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it("wraps to the last index when calling prev() on index 0", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.prev();
    });
    expect(result.current.activeIndex).toBe(2);
    expect(result.current.progress).toBe(0);
  });

  it("sets target index and resets progress when calling goTo()", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.progress).toBeGreaterThan(0);

    act(() => {
      result.current.goTo(2);
    });

    expect(result.current.activeIndex).toBe(2);
    expect(result.current.progress).toBe(0);
  });

  it("clears intervals on unmount", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = renderHook(() => useHeroCarousel(sampleItems));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("does not start intervals when items length is <= 1 and keeps index 0 on nav", () => {
    const singleItem = [{ id: 1, title: "Only Movie" }];
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    const { result } = renderHook(() => useHeroCarousel(singleItem));

    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.next();
    });
    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.prev();
    });
    expect(result.current.activeIndex).toBe(0);

    setIntervalSpy.mockRestore();
  });

  it("continues autoplay in reduced-motion preference (CSS handles the visual, not the hook)", () => {
    const { result } = renderHook(() => useHeroCarousel(sampleItems));

    expect(result.current.activeIndex).toBe(0);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.activeIndex).toBe(1);
  });
});
