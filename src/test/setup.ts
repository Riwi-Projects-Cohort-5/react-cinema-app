import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { useSessionStore } from "@services/session";

afterEach(() => {
  cleanup();
  useSessionStore.setState({ accessToken: null });
});
