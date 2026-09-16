import type { RegisterPayload, RegisterResponse } from "../interfaces/Register.interfaces";
import { httpClient } from "@services/httpClient";

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await httpClient.post("/auth/register", payload);
  return response.data as RegisterResponse;
};
