import { createBrowserRouter, type RouteObject } from "react-router";

import { LoginPage } from "@features/auth/pages/login/LoginPage";
import { RegisterPage } from "@features/auth/pages/register/pages/RegisterPage";
import { MainLayout } from "@layouts";
import { GeneralErrorPage, NotFoundPage } from "@pages";
import { PublicOnlyRoute, ProtectedRoute } from "@routes/guards";
import { PlaceholderPage } from "@shared/components/PlaceholderPage";

import { PATHS } from "@routes/paths";

export const appRoutes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: PATHS.home,
        element: <PlaceholderPage title="Home" />,
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
        element: <ProtectedRoute />,
        children: [
          {
            path: PATHS.admin.dashboard,
            element: <PlaceholderPage title="Admin Dashboard" />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: PATHS.auth.login, element: <LoginPage /> },
      { path: PATHS.auth.register, element: <RegisterPage /> },
    ],
  },
  {
    path: PATHS.error,
    element: <GeneralErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export const appRouter = createBrowserRouter(appRoutes);
