import { createBrowserRouter, type RouteObject } from "react-router";

import { LoginPage } from "@features/auth/pages/login/LoginPage";
import { RegisterPage } from "@features/auth/pages/register/RegisterPage";
import { AdminLayout, AuthenticatedLayout, MainLayout } from "@layouts";
import { GeneralErrorPage, NotFoundPage } from "@pages";
import { ProtectedRoute, PublicOnlyRoute } from "@routes/guards";
import { HomePage } from "@features/movies/pages/HomePage";
import { PlaceholderPage } from "@shared/components/PlaceholderPage";

import { PATHS } from "@routes/paths";

export const appRoutes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        path: PATHS.home,
        element: <HomePage />,
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
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [
          { path: PATHS.profile, element: <PlaceholderPage title="Profile" /> },
          {
            path: PATHS.purchaseHistory,
            element: <PlaceholderPage title="Purchase History" />,
          },
          { path: PATHS.checkout, element: <PlaceholderPage title="Checkout" /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
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
    path: PATHS.error,
    element: <GeneralErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export const appRouter = createBrowserRouter(appRoutes);
