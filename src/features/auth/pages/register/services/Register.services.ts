import type { RegisterPayload, RegisterResponse } from "../interfaces/Register.interfaces";

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await fetch("https://api.multicine.com/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as RegisterResponse & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "No se pudo completar el registro.");
  }

  return data;
};