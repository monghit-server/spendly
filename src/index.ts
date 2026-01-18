import express from 'express';
import { loadConfig } from './infrastructure/config';
import { EventStoreClient, EventSourcedRepository } from './infrastructure/eventstore';
import { Familia } from './domain/familia';
import { Presupuesto } from './domain/presupuesto';
import { Transaccion } from './domain/transaccion';
import {
  FamiliaCommandHandler,
  PresupuestoCommandHandler,
  TransaccionCommandHandler,
} from './application/commands';
import {
  createFamiliaRoutes,
  createPresupuestoRoutes,
  createTransaccionRoutes,
} from './api/routes';
import {
  createActuatorRoutes,
  createPostgresHealthChecker,
  createRedisHealthChecker,
  createEventStoreHealthChecker,
  createMemoryHealthChecker,
} from './api/actuator';

async function main(): Promise<void> {
  const config = loadConfig();

  // Inicializar EventStore
  const eventStore = new EventStoreClient({
    host: config.eventstore.host,
    port: config.eventstore.port,
    insecure: config.eventstore.insecure,
  });

  // Crear repositorios
  const familiaRepository = new EventSourcedRepository(eventStore, 'Familia', Familia);
  const presupuestoRepository = new EventSourcedRepository(eventStore, 'Presupuesto', Presupuesto);
  const transaccionRepository = new EventSourcedRepository(eventStore, 'Transaccion', Transaccion);

  // Crear command handlers
  const familiaHandler = new FamiliaCommandHandler(familiaRepository);
  const presupuestoHandler = new PresupuestoCommandHandler(presupuestoRepository);
  const transaccionHandler = new TransaccionCommandHandler(transaccionRepository);

  // Configurar health checkers
  const healthCheckers = {
    postgres: createPostgresHealthChecker({
      host: config.postgres.host,
      port: config.postgres.port,
    }),
    redis: createRedisHealthChecker({
      host: config.redis.host,
      port: config.redis.port,
    }),
    eventstore: createEventStoreHealthChecker({
      host: config.eventstore.host,
      port: config.eventstore.port,
    }),
    memory: createMemoryHealthChecker(90),
  };

  // Configurar Express
  const app = express();

  app.use(express.json());

  // Actuator endpoints (health, info, metrics, ready, live)
  app.use('/actuator', createActuatorRoutes({ healthCheckers }));

  // Rutas API
  app.use('/api/v1/familias', createFamiliaRoutes(familiaHandler));
  app.use('/api/v1/presupuestos', createPresupuestoRoutes(presupuestoHandler));
  app.use('/api/v1/transacciones', createTransaccionRoutes(transaccionHandler));

  // Iniciar servidor
  app.listen(config.server.port, () => {
    console.log(`Walletwise API iniciada en puerto ${config.server.port}`);
    console.log(`Entorno: ${config.server.nodeEnv}`);
  });

  // Manejo de cierre graceful
  process.on('SIGTERM', async () => {
    console.log('Cerrando aplicacion...');
    await eventStore.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Error al iniciar la aplicacion:', error);
  process.exit(1);
});
