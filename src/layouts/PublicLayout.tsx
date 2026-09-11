import { Link, Outlet, useLocation } from "react-router";

import { PATHS } from "@routes/paths";

export function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === PATHS.home;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-text-primary">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to={PATHS.home} className="text-lg font-bold text-text-primary">
            Multicine
          </Link>
          <nav className="flex items-center gap-4">
            <Link to={PATHS.home} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Inicio
            </Link>
            <Link to={PATHS.auth.login} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Iniciar sesión
            </Link>
            <Link
              to={PATHS.auth.register}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Registrarse
            </Link>
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
