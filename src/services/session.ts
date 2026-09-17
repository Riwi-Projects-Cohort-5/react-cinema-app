import { create } from "zustand";

interface SessionState {
  accessToken: string | null;
  userId: string | null;
  setAccessToken: (accessToken: string | null) => void;
  setUserId: (userId: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  userId: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setUserId: (userId) => set({ userId }),
  clearSession: () => set({ accessToken: null, userId: null }),
}));

export function getAccessToken(): string | null {
  return useSessionStore.getState().accessToken;
}

export function clearSession(): void {
  useSessionStore.getState().clearSession();
}

export async function refreshAccessToken(): Promise<string> {
  throw new Error("Auth refresh is not implemented yet");
}
