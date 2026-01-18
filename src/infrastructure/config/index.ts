/**
 * Configuracion de la aplicacion
 */
export interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  postgres: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  eventstore: {
    host: string;
    port: number;
    insecure: boolean;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
}

/**
 * Carga la configuracion desde variables de entorno
 */
export function loadConfig(): Config {
  return {
    server: {
      port: parseInt(process.env['PORT'] ?? '3000', 10),
      nodeEnv: process.env['NODE_ENV'] ?? 'development',
    },
    postgres: {
      host: process.env['POSTGRES_HOST'] ?? 'localhost',
      port: parseInt(process.env['POSTGRES_PORT'] ?? '5432', 10),
      user: process.env['POSTGRES_USER'] ?? 'walletwise',
      password: process.env['POSTGRES_PASSWORD'] ?? 'walletwise_secret',
      database: process.env['POSTGRES_DB'] ?? 'walletwise',
    },
    eventstore: {
      host: process.env['EVENTSTORE_HOST'] ?? 'localhost',
      port: parseInt(process.env['EVENTSTORE_PORT'] ?? '2113', 10),
      insecure: process.env['EVENTSTORE_INSECURE'] === 'true',
    },
    redis: {
      host: process.env['REDIS_HOST'] ?? 'localhost',
      port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
      password: process.env['REDIS_PASSWORD'] ?? '',
    },
  };
}
