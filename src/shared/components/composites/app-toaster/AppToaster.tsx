import { Toaster } from "sonner";

import { useTheme, type Theme } from "@shared/hooks";

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
      toastOptions={{
        classNames: {
          toast:
            "border! border-border! bg-surface! font-secondary! text-caption! text-text-primary! shadow-md!",
          title: "font-primary! text-sm! font-semibold! text-text-primary!",
          description: "text-caption! text-text-secondary!",
          actionButton:
            "bg-primary! font-medium! text-text-primary! transition-colors! duration-fast! hover:bg-primary-hover!",
          cancelButton: "border! border-border! bg-surface-variant! text-text-secondary!",
          closeButton: "border! border-border! bg-surface-variant! text-text-secondary!",
          success: "border-l-success!",
          error: "border-l-error!",
          info: "border-l-info!",
          warning: "border-l-warning!",
        },
      }}
    />
  );
}
