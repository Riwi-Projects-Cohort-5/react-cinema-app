import { Navigate, Outlet } from "react-router";

import { useSessionStore } from "@services/session";

import { PATHS } from "@routes/paths";

export function PublicOnlyRoute() {
  const accessToken = useSessionStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to={PATHS.home} replace />;
  }

  return <Outlet />;
}
