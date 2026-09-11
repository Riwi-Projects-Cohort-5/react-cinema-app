import { Moon, Sun } from "@phosphor-icons/react";
import { Link, Outlet, useLocation } from "react-router";

import { PATHS } from "@routes/paths";
import { useTheme } from "@shared/hooks";

export function PublicLayout() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isHome = pathname === PATHS.home;
  const isLight = theme === "light";
  const label = isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-text-primary">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to={PATHS.home} className="text-lg font-bold text-text-primary">
            Multicine
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to={PATHS.home} className="text-xs sm:text-sm text-text-secondary transition-colors hover:text-text-primary">
              Inicio
            </Link>
            <Link to={PATHS.auth.login} className="text-xs sm:text-sm text-text-secondary transition-colors hover:text-text-primary">
              Iniciar sesión
            </Link>
            <Link
              to={PATHS.auth.register}
              className="rounded-md bg-primary px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Registrarse
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={label}
              aria-pressed={isLight}
              title={label}
              className="flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-variant hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {isLight ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </button>
          </nav>
        </div>
      </header>

      <main className={isHome ? "w-full flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-8"}>
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-sm text-text-secondary">
          © {new Date().getFullYear()} Multicine
        </div>
      </footer>
    </div>
  );
}
