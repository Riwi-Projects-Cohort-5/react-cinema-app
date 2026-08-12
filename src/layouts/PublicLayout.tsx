import { Link, Outlet } from "react-router";

import { PATHS } from "@routes/paths";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to={PATHS.home} className="text-lg font-bold text-gray-900">
            Multicine
          </Link>
          <nav className="flex items-center gap-4">
            <Link to={PATHS.home} className="text-sm text-gray-700 hover:text-gray-900">
              Inicio
            </Link>
            <Link to={PATHS.auth.login} className="text-sm text-gray-700 hover:text-gray-900">
              Iniciar sesión
            </Link>
            <Link
              to={PATHS.auth.register}
              className="rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Multicine
        </div>
      </footer>
    </div>
  );
}
