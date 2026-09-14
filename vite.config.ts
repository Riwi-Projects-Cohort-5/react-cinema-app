import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@assets": path.resolve(import.meta.dirname, "./src/assets"),
      "@config": path.resolve(import.meta.dirname, "./src/config"),
      "@features": path.resolve(import.meta.dirname, "./src/features"),
      "@layouts": path.resolve(import.meta.dirname, "./src/layouts"),
      "@pages": path.resolve(import.meta.dirname, "./src/pages"),
      "@routes": path.resolve(import.meta.dirname, "./src/routes"),
      "@services": path.resolve(import.meta.dirname, "./src/services"),
      "@shared": path.resolve(import.meta.dirname, "./src/shared"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Fija el entorno de las pruebas para que no dependa del .env.local de cada desarrollador.
    env: {
      VITE_API_BASE_URL: "/api/v1",
      VITE_API_TIMEOUT_MS: "15000",
      VITE_ENABLE_MOCKS: "false",
    },
  },
});
