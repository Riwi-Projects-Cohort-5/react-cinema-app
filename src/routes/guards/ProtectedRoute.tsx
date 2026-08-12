import { Navigate, Outlet, useLocation } from "react-router";

import { useSessionStore } from "@services/session";

import { PATHS } from "@routes/paths";

export function ProtectedRoute() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to={PATHS.auth.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
