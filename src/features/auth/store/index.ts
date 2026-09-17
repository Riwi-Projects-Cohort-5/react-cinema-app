import { create } from "zustand";

interface AuthUiState {
  lockedUntil: number | null;
  loginErrorMessage: string | null;
  setLockout: (lockedUntil: number, message: string) => void;
  setLoginErrorMessage: (message: string | null) => void;
  clearLoginFeedback: () => void;
}

export const useAuthStore = create<AuthUiState>((set) => ({
  lockedUntil: null,
  loginErrorMessage: null,
  setLockout: (lockedUntil, message) => set({ lockedUntil, loginErrorMessage: message }),
  setLoginErrorMessage: (loginErrorMessage) => set({ loginErrorMessage }),
  clearLoginFeedback: () => set({ lockedUntil: null, loginErrorMessage: null }),
}));