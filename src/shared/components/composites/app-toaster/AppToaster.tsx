import { Toaster } from "sonner";

import { useTheme, type Theme } from "@shared/hooks";
import { cn } from "@shared/utils/cn";

interface AppToasterProps {
  theme?: Theme;
}

export function AppToaster({ theme: forcedTheme }: AppToasterProps = {}) {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={forcedTheme ?? theme}
      position="top-right"
      closeButton
      richColors={false}
style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-border": "var(--color-border)",
          "--normal-text": "var(--color-text-primary)",
          "--success-bg": "var(--color-surface)",
          "--success-border": "var(--color-success)",
          "--success-text": "var(--color-text-primary)",
          "--error-bg": "var(--color-surface)",
          "--error-border": "var(--color-error)",
          "--error-text": "var(--color-text-primary)",
          "--info-bg": "var(--color-surface)",
          "--info-border": "var(--color-info)",
          "--info-text": "var(--color-text-primary)",
          "--warning-bg": "var(--color-surface)",
          "--warning-border": "var(--color-warning)",
          "--warning-text": "var(--color-text-primary)",
          "--border-radius": "var(--radius-md)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: cn(
            "border border-border bg-surface",
            "font-secondary text-caption text-text-primary",
            "shadow-md"
          ),
          title: "font-primary text-sm font-semibold text-text-primary",
          description: "text-caption text-text-secondary",
          actionButton: cn(
            "bg-primary font-medium text-text-primary",
            "transition-colors duration-fast hover:bg-primary-hover"
          ),
          cancelButton: "border border-border bg-surface-variant text-text-secondary",
          closeButton: "border border-border bg-surface-variant text-text-secondary",
          success: "border-l-success",
          error: "border-l-error",
          info: "border-l-info",
          warning: "border-l-warning",
        },
      }}
    />
  );
}
