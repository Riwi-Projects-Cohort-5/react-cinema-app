 import { httpClient } from "@services/httpClient";

import type { LoginRequest, LoginResponse } from "@features/auth/interfaces";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>("/auth/login", payload);
  return data;
}
