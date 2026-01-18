/**
 * Estado de salud de un componente
 */
export type HealthStatus = 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';

/**
 * Detalle de salud de un componente
 */
export interface HealthDetail {
  status: HealthStatus;
  details?: Record<string, unknown>;
}

/**
 * Respuesta del endpoint /health
 */
export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  components: Record<string, HealthDetail>;
}

/**
 * Respuesta del endpoint /info
 */
export interface InfoResponse {
  app: {
    name: string;
    version: string;
    description: string;
  };
  runtime: {
    node: string;
    platform: string;
    arch: string;
  };
  build: {
    timestamp: string;
    env: string;
  };
}

/**
 * Metricas del sistema
 */
export interface MetricsResponse {
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  process: {
    pid: number;
    uptime: number;
  };
}

/**
 * Health check function type
 */
export type HealthChecker = () => Promise<HealthDetail>;
