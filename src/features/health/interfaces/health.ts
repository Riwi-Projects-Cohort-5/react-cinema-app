export interface HealthResponse {
  status: string;
  uptime:number;
  timestamp:string;
  services: {
    database:string;
  };
}
