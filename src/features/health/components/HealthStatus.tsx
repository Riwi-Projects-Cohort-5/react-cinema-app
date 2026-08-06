import { useHealth } from "@features/health/hooks/useHealth";

const baseClassName =
  "fixed bottom-4 left-4 z-50 rounded-full px-4 py-2 text-sm font-medium shadow-lg";

export function HealthStatus() {
  const health = useHealth();
  const isHealthy = health.isSuccess && health.data?.status === "ok";

  if (health.isPending) {
    return (
      <div className={`${baseClassName} bg-gray-800 text-white`}>
        Verificando conexión...
      </div>
    );
  }

  if (isHealthy) {
    return (
      <div className={`${baseClassName} bg-green-600 text-white`}>
        Servicio en línea
      </div>
    );
  }

  return (
    <div className={`${baseClassName} bg-amber-500 text-white`}>
      Conexión inestable
    </div>
  );
}
