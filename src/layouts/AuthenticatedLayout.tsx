import { Link, Outlet } from "react-router";

import { PATHS } from "@routes/paths";

const NAV_ITEMS = [
  { to: PATHS.profile, label: "Perfil" },
  { to: PATHS.purchaseHistory, label: "Historial de compras" },
  { to: PATHS.checkout, label: "Checkout" },
];

export function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to={PATHS.home} className="text-lg font-bold text-gray-900">
            Multicine
          </Link>
          <nav className="flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
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
