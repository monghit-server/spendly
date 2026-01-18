import { HealthDetail, HealthChecker } from './types';

/**
 * Crea un health checker para PostgreSQL
 */
export function createPostgresHealthChecker(config: {
  host: string;
  port: number;
}): HealthChecker {
  return async (): Promise<HealthDetail> => {
    try {
      // Check TCP connection
      const net = await import('net');
      return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 3000;

        socket.setTimeout(timeout);

        socket.on('connect', () => {
          socket.destroy();
          resolve({
            status: 'UP',
            details: { host: config.host, port: config.port },
          });
        });

        socket.on('timeout', () => {
          socket.destroy();
          resolve({
            status: 'DOWN',
            details: { error: 'Connection timeout' },
          });
        });

        socket.on('error', (err) => {
          socket.destroy();
          resolve({
            status: 'DOWN',
            details: { error: err.message },
          });
        });

        socket.connect(config.port, config.host);
      });
    } catch (error) {
      return {
        status: 'DOWN',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  };
}

/**
 * Crea un health checker para Redis
 */
export function createRedisHealthChecker(config: {
  host: string;
  port: number;
}): HealthChecker {
  return async (): Promise<HealthDetail> => {
    try {
      const net = await import('net');
      return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 3000;

        socket.setTimeout(timeout);

        socket.on('connect', () => {
          socket.destroy();
          resolve({
            status: 'UP',
            details: { host: config.host, port: config.port },
          });
        });

        socket.on('timeout', () => {
          socket.destroy();
          resolve({
            status: 'DOWN',
            details: { error: 'Connection timeout' },
          });
        });

        socket.on('error', (err) => {
          socket.destroy();
          resolve({
            status: 'DOWN',
            details: { error: err.message },
          });
        });

        socket.connect(config.port, config.host);
      });
    } catch (error) {
      return {
        status: 'DOWN',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  };
}

/**
 * Crea un health checker para EventStoreDB
 */
export function createEventStoreHealthChecker(config: {
  host: string;
  port: number;
}): HealthChecker {
  return async (): Promise<HealthDetail> => {
    try {
      const http = await import('http');
      return new Promise((resolve) => {
        const req = http.request(
          {
            host: config.host,
            port: config.port,
            path: '/health/live',
            method: 'GET',
            timeout: 3000,
          },
          (res) => {
            resolve({
              status: res.statusCode === 204 || res.statusCode === 200 ? 'UP' : 'DOWN',
              details: { host: config.host, port: config.port, statusCode: res.statusCode },
            });
          }
        );

        req.on('timeout', () => {
          req.destroy();
          resolve({
            status: 'DOWN',
            details: { error: 'Connection timeout' },
          });
        });

        req.on('error', (err) => {
          resolve({
            status: 'DOWN',
            details: { error: err.message },
          });
        });

        req.end();
      });
    } catch (error) {
      return {
        status: 'DOWN',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  };
}

/**
 * Health checker para memoria del sistema
 */
export function createMemoryHealthChecker(thresholdPercent: number = 90): HealthChecker {
  return async (): Promise<HealthDetail> => {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    return {
      status: heapUsedPercent < thresholdPercent ? 'UP' : 'DEGRADED',
      details: {
        heapUsedPercent: Math.round(heapUsedPercent * 100) / 100,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
      },
    };
  };
}
