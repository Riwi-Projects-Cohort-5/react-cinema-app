import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import { registerGlobalErrorHandlers } from "@services/globalErrorHandlers";
import { ErrorBoundary } from "@shared/components/ErrorBoundary";

registerGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
