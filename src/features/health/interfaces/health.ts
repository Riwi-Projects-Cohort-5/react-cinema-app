export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  database: string;
  uptimeSeconds: number;
}
