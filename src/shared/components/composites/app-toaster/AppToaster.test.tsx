import { render, screen } from "@testing-library/react";

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { notifyError, notifyInfo, notifySuccess } from "@services/notify";

import { AppToaster } from "./AppToaster";

function mockMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("AppToaster", () => {
  beforeAll(() => {
    mockMatchMedia();
  });

  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("renders themed success toasts", async () => {
    render(<AppToaster />);

    notifySuccess("Entradas reservadas", "Tu hold vence en 10 minutos.");

    expect(await screen.findByText("Entradas reservadas")).toBeInTheDocument();
  });

  it("renders themed error toasts", async () => {
    render(<AppToaster />);

    notifyError(new Error("Fallo de red"));

    expect(await screen.findByText("Fallo de red")).toBeInTheDocument();
  });

  it("accepts a forced theme prop", async () => {
    render(<AppToaster theme="light" />);

    notifyInfo("Aviso de prueba");

    expect(await screen.findByText("Aviso de prueba")).toBeInTheDocument();
  });
});
