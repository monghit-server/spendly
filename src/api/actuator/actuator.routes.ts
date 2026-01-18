import { Router, Request, Response } from 'express';
import {
  HealthStatus,
  HealthResponse,
  InfoResponse,
  MetricsResponse,
  HealthChecker,
} from './types';

// Version del package.json
const APP_VERSION = process.env['npm_package_version'] ?? '1.0.0';
const APP_NAME = process.env['npm_package_name'] ?? 'walletwise';
const START_TIME = Date.now();

export interface ActuatorConfig {
  healthCheckers: Record<string, HealthChecker>;
}

/**
 * Crea las rutas de actuator
 */
export function createActuatorRoutes(config: ActuatorConfig): Router {
  const router = Router();

  /**
   * GET /actuator - Lista de endpoints disponibles
   */
  router.get('/', (_req: Request, res: Response) => {
    res.json({
      _links: {
        self: { href: '/actuator' },
        health: { href: '/actuator/health' },
        info: { href: '/actuator/info' },
        metrics: { href: '/actuator/metrics' },
        ready: { href: '/actuator/ready' },
        live: { href: '/actuator/live' },
      },
    });
  });

  /**
   * GET /actuator/health - Estado de salud completo
   */
  router.get('/health', async (_req: Request, res: Response) => {
    const components: Record<string, { status: HealthStatus; details?: Record<string, unknown> }> = {};
    let overallStatus: HealthStatus = 'UP';

    // Ejecutar todos los health checks en paralelo
    const checks = Object.entries(config.healthCheckers).map(async ([name, checker]) => {
      const result = await checker();
      components[name] = result;

      if (result.status === 'DOWN') {
        overallStatus = 'DOWN';
      } else if (result.status === 'DEGRADED' && overallStatus !== 'DOWN') {
        overallStatus = 'DEGRADED';
      }
    });

    await Promise.all(checks);

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components,
    };

    const statusCode = overallStatus === 'UP' ? 200 : overallStatus === 'DEGRADED' ? 200 : 503;
    res.status(statusCode).json(response);
  });

  /**
   * GET /actuator/info - Informacion de la aplicacion
   */
  router.get('/info', (_req: Request, res: Response) => {
    const response: InfoResponse = {
      app: {
        name: APP_NAME,
        version: APP_VERSION,
        description: 'Family budget planner with CQRS and Event Sourcing',
      },
      runtime: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      build: {
        timestamp: new Date(START_TIME).toISOString(),
        env: process.env['NODE_ENV'] ?? 'development',
      },
    };

    res.json(response);
  });

  /**
   * GET /actuator/metrics - Metricas del sistema
   */
  router.get('/metrics', (_req: Request, res: Response) => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const response: MetricsResponse = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
      },
    };

    res.json(response);
  });

  /**
   * GET /actuator/ready - Readiness probe (K8s)
   * Indica si la aplicacion esta lista para recibir trafico
   */
  router.get('/ready', async (_req: Request, res: Response) => {
    // Verificar conexiones criticas
    let ready = true;
    const details: Record<string, string> = {};

    for (const [name, checker] of Object.entries(config.healthCheckers)) {
      const result = await checker();
      if (result.status === 'DOWN') {
        ready = false;
        details[name] = 'DOWN';
      } else {
        details[name] = 'UP';
      }
    }

    if (ready) {
      res.status(200).json({ status: 'READY', details });
    } else {
      res.status(503).json({ status: 'NOT_READY', details });
    }
  });

  /**
   * GET /actuator/live - Liveness probe (K8s)
   * Indica si la aplicacion esta viva (debe reiniciarse si falla)
   */
  router.get('/live', (_req: Request, res: Response) => {
    // Si podemos responder, estamos vivos
    res.status(200).json({
      status: 'ALIVE',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
