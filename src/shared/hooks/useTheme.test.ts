import { act, renderHook } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY, getTheme, useTheme } from "./useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("defaults to dark when nothing is stored", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });

  it("reads the stored theme from localStorage", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
  });

  it("toggleTheme persists and applies the opposite theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(getTheme()).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(getTheme()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("handles storage fallback when localStorage throws", () => {
    const originalSetItem = window.localStorage.setItem;
    const originalGetItem = window.localStorage.getItem;

    window.localStorage.getItem = () => {
      throw new Error("localStorage disabled");
    };
    window.localStorage.setItem = () => {
      throw new Error("localStorage disabled");
    };

    expect(getTheme()).toBe("dark");

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");

    window.localStorage.setItem = originalSetItem;
    window.localStorage.getItem = originalGetItem;
  });

  it("setTheme persists and applies the chosen theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
