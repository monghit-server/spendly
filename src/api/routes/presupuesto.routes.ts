import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  PresupuestoCommandHandler,
  CrearPresupuesto,
  ActualizarLimite,
} from '../../application/commands';

/**
 * Crea las rutas para el agregado Presupuesto
 */
export function createPresupuestoRoutes(handler: PresupuestoCommandHandler): Router {
  const router = Router();

  /**
   * POST /presupuestos - Crear un nuevo presupuesto
   */
  router.post('/', async (req: Request, res: Response) => {
    const command: CrearPresupuesto = {
      commandId: uuidv4(),
      commandType: 'CrearPresupuesto',
      issuedAt: new Date(),
      data: {
        presupuestoId: uuidv4(),
        familiaId: req.body.familiaId,
        nombre: req.body.nombre,
        moneda: req.body.moneda ?? 'EUR',
        periodoInicio: req.body.periodoInicio,
        periodoFin: req.body.periodoFin,
        limites: req.body.limites ?? [],
      },
    };

    const result = await handler.crearPresupuesto(command);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  });

  /**
   * PATCH /presupuestos/:id/limites/:categoriaId - Actualizar limite de categoria
   */
  router.patch('/:id/limites/:categoriaId', async (req: Request, res: Response) => {
    const command: ActualizarLimite = {
      commandId: uuidv4(),
      commandType: 'ActualizarLimite',
      issuedAt: new Date(),
      data: {
        presupuestoId: req.params['id'] ?? '',
        categoriaId: req.params['categoriaId'] ?? '',
        nuevoLimite: req.body.limite,
      },
    };

    const result = await handler.actualizarLimite(command);

    if (result.success) {
      res.status(200).json({ message: 'Limite actualizado' });
    } else {
      res.status(400).json({ error: result.error });
    }
  });

  return router;
}
