export const PATHS = {
  home: "/",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
  },
  profile: "/profile",
  purchaseHistory: "/purchase-history",
  checkout: "/checkout",
  admin: {
    dashboard: "/admin/dashboard",
  },
  error: "/error",
} as const;
