import { Link, Outlet } from "react-router";

import { PATHS } from "@routes/paths";

const NAV_ITEMS = [{ to: PATHS.admin.dashboard, label: "Dashboard" }];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <Link
          to={PATHS.home}
          className="border-b border-gray-200 px-4 py-5 text-lg font-bold text-gray-900"
        >
          Multicine Admin
        </Link>
        <nav className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
