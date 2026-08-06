import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@config/env";
import { PATHS } from "@routes/paths";
import {
  clearSession,
  getAccessToken,
  refreshAccessToken,
  useSessionStore,
} from "@services/session";

import { ApiError, type ApiErrorEnvelope } from "@services/api-error";

const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";

interface HttpRequestConfig extends InternalAxiosRequestConfig {
  dedupeKey?: string;
  _retried?: boolean;
}

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: "application/json",
    "Accept-Language": "es",
  },
});

const rawClient = axios.create();

const inFlightRequests = new Map<string, Promise<AxiosResponse>>();

let isRefreshing = false;
let pendingRequests: Array<(accessToken: string | null) => void> = [];

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function buildDedupeKey(config: InternalAxiosRequestConfig): string {
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${config.method ?? "get"}|${config.url ?? ""}|${params}`;
}

function getErrorCode(error: AxiosError<ApiErrorEnvelope>): string | undefined {
  return error.response?.data?.error?.code;
}

function toApiError(error: AxiosError<ApiErrorEnvelope>): ApiError {
  if (axios.isCancel(error)) {
    return new ApiError("La petición fue cancelada", { isCanceled: true });
  }

  const payload = error.response?.data?.error;

  if (error.response) {
    return new ApiError(payload?.message ?? error.message, {
      status: error.response.status,
      code: payload?.code,
      details: payload?.details,
      requestId: payload?.requestId,
      retryAfterSeconds: payload?.retryAfterSeconds,
    });
  }

  return new ApiError("No se pudo conectar con el servidor", { isNetwork: true });
}

function terminateSession(): void {
  clearSession();
  if (window.location.pathname !== PATHS.auth.login) {
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, window.location.pathname);
    window.location.assign(PATHS.auth.login);
  }
}

function retryOriginalRequest(
  config: HttpRequestConfig,
  accessToken: string
): Promise<AxiosResponse> {
  const retryConfig: HttpRequestConfig = { ...config, _retried: true };
  retryConfig.headers.set("Authorization", `Bearer ${accessToken}`);
  delete retryConfig.adapter;
  return httpClient.request(retryConfig);
}

async function handleUnauthorized(
  error: AxiosError<ApiErrorEnvelope>,
  config: HttpRequestConfig | undefined
): Promise<never> {
  if (!config || config._retried || !getAccessToken()) {
    return Promise.reject(toApiError(error));
  }

  if (isRefreshing) {
    return new Promise<never>((resolve, reject) => {
      pendingRequests.push((accessToken) => {
        if (accessToken) {
          resolve(retryOriginalRequest(config, accessToken) as never);
        } else {
          reject(toApiError(error));
        }
      });
    });
  }

  isRefreshing = true;
  try {
    const accessToken = await refreshAccessToken();
    useSessionStore.getState().setAccessToken(accessToken);
    pendingRequests.forEach((resolve) => resolve(accessToken));
    pendingRequests = [];
    return retryOriginalRequest(config, accessToken) as never;
  } catch {
    pendingRequests.forEach((resolve) => resolve(null));
    pendingRequests = [];
    terminateSession();
    return Promise.reject(toApiError(error));
  } finally {
    isRefreshing = false;
  }
}

httpClient.interceptors.request.use((config) => {
  const requestConfig = config as HttpRequestConfig;
  requestConfig.headers.set("X-Request-Id", createRequestId());

  const accessToken = getAccessToken();
  if (accessToken) {
    requestConfig.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (config.method?.toLowerCase() !== "get") {
    return config;
  }

  const dedupeKey = buildDedupeKey(config);
  requestConfig.dedupeKey = dedupeKey;

  const inFlight = inFlightRequests.get(dedupeKey);
  if (inFlight) {
    config.adapter = async () => inFlight;
    return config;
  }

  config.adapter = async (dispatchConfig) => {
    const promise = rawClient.request({ ...dispatchConfig, adapter: undefined });
    inFlightRequests.set(dedupeKey, promise);
    return promise;
  };
  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    const requestConfig = response.config as HttpRequestConfig;
    if (requestConfig.dedupeKey) {
      inFlightRequests.delete(requestConfig.dedupeKey);
    }
    return response;
  },
  (error) => {
    const axiosError = error as AxiosError<ApiErrorEnvelope>;
    const requestConfig = axiosError.config as HttpRequestConfig | undefined;

    if (requestConfig?.dedupeKey) {
      inFlightRequests.delete(requestConfig.dedupeKey);
    }

    if (
      axiosError.response?.status === 401 &&
      getErrorCode(axiosError) === "ACCESS_TOKEN_EXPIRED"
    ) {
      return handleUnauthorized(axiosError, requestConfig);
    }

    return Promise.reject(toApiError(axiosError));
  }
);
