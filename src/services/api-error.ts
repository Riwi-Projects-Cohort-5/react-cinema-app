export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetail[];
    requestId?: string;
    retryAfterSeconds?: number;
  };
}

interface ApiErrorOptions {
  status?: number;
  code?: string;
  details?: ApiErrorDetail[];
  requestId?: string;
  retryAfterSeconds?: number;
  isCanceled?: boolean;
  isNetwork?: boolean;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: ApiErrorDetail[];
  requestId?: string;
  retryAfterSeconds?: number;
  isCanceled: boolean;
  isNetwork: boolean;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.isCanceled = options.isCanceled ?? false;
    this.isNetwork = options.isNetwork ?? false;
  }
}
