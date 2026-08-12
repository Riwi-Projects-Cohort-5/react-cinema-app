import { Link } from "react-router";

import { PATHS } from "@routes/paths";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="max-w-md text-sm text-gray-600">
        La página que buscas no existe o fue movida a otra dirección.
      </p>
      <Link
        to={PATHS.home}
        className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
