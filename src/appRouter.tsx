import { createBrowserRouter } from "react-router";

import { LoginPage } from "@features/auth/pages/login/LoginPage";
import { RegisterPage } from "@features/auth/pages/register/RegisterPage";
import { ProtectedRoute } from "@routes/ProtectedRoute";
import { PublicOnlyRoute } from "@routes/PublicOnlyRoute";
import { PlaceholderPage } from "@shared/components/PlaceholderPage";

import { PATHS } from "@routes/paths";

export const appRouter = createBrowserRouter([
  {
    path: PATHS.home,
    element: <PlaceholderPage title="Home" />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: PATHS.auth.login, element: <LoginPage /> },
      { path: PATHS.auth.register, element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: PATHS.profile, element: <PlaceholderPage title="Profile" /> },
      {
        path: PATHS.purchaseHistory,
        element: <PlaceholderPage title="Purchase History" />,
      },
      { path: PATHS.checkout, element: <PlaceholderPage title="Checkout" /> },
    ],
  },
  {
    path: "*",
    element: <PlaceholderPage title="Page not found" />,
  },
]);
