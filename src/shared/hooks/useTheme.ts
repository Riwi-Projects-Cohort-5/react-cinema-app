import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "react-cinema-theme";

const THEME_CHANGE_EVENT = "react-cinema:theme";

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function getTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme): void {
  if (theme === "light") {
    document.documentElement.dataset.theme = "light";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Almacenamiento no disponible: el tema se aplica igualmente en la sesión actual.
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeEvent = (event: Event): void => {
      const next = (event as CustomEvent<Theme>).detail;
      setThemeState(isTheme(next) ? next : getTheme());
    };

    const handleStorage = (event: StorageEvent): void => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }
      setThemeState(isTheme(event.newValue) ? event.newValue : "dark");
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
