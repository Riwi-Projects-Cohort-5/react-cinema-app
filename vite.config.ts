import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@assets": path.resolve(import.meta.dirname, "./src/assets"),
      "@config": path.resolve(import.meta.dirname, "./src/config"),
      "@features": path.resolve(import.meta.dirname, "./src/features"),
      "@routes": path.resolve(import.meta.dirname, "./src/routes"),
      "@services": path.resolve(import.meta.dirname, "./src/services"),
      "@shared": path.resolve(import.meta.dirname, "./src/shared"),
    },
  },
});
