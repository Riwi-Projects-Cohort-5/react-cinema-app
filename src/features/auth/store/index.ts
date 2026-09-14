import { create } from "zustand";

import type { AuthUser } from "@features/auth/interfaces";

interface AuthUiState {
  user: AuthUser | null;
  lockedUntil: number | null;
  loginErrorMessage: string | null;
  setUser: (user: AuthUser | null) => void;
  setLockout: (lockedUntil: number, message: string) => void;
  setLoginErrorMessage: (message: string | null) => void;
  clearLoginFeedback: () => void;
}

export const useAuthStore = create<AuthUiState>((set) => ({
  user: null,
  lockedUntil: null,
  loginErrorMessage: null,
  setUser: (user) => set({ user }),
  setLockout: (lockedUntil, message) => set({ lockedUntil, loginErrorMessage: message }),
  setLoginErrorMessage: (loginErrorMessage) => set({ loginErrorMessage }),
  clearLoginFeedback: () => set({ lockedUntil: null, loginErrorMessage: null }),
}));