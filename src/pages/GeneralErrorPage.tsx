import { Link } from "react-router";

import { PATHS } from "@routes/paths";

interface GeneralErrorPageProps {
  message?: string;
}

export function GeneralErrorPage({ message }: GeneralErrorPageProps) {
  const handleReload = (): void => {
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-800">Algo salió mal</h1>
      <p className="max-w-md text-sm text-gray-600">
        {message || "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleReload}
          className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Recargar
        </button>
        <Link
          to={PATHS.home}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
