import { z } from "zod";

function isHttpUrlOrRootRelative(value: string): boolean {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .refine(isHttpUrlOrRootRelative, {
      message: "Debe ser una URL http(s) o una ruta relativa que empiece con '/'",
    })
    .default("/api/v1"),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Variables de entorno inválidas:\n${details}`);
}

export const env = {
  apiBaseUrl: parsedEnv.data.VITE_API_BASE_URL,
  apiTimeoutMs: parsedEnv.data.VITE_API_TIMEOUT_MS,
};
