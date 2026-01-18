import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  TransaccionCommandHandler,
  RegistrarGasto,
  RegistrarIngreso,
} from '../../application/commands';

/**
 * Crea las rutas para el agregado Transaccion
 */
export function createTransaccionRoutes(handler: TransaccionCommandHandler): Router {
  const router = Router();

  /**
   * POST /transacciones/gastos - Registrar un gasto
   */
  router.post('/gastos', async (req: Request, res: Response) => {
    const command: RegistrarGasto = {
      commandId: uuidv4(),
      commandType: 'RegistrarGasto',
      issuedAt: new Date(),
      data: {
        transaccionId: uuidv4(),
        familiaId: req.body.familiaId,
        presupuestoId: req.body.presupuestoId,
        categoriaId: req.body.categoriaId,
        monto: req.body.monto,
        moneda: req.body.moneda ?? 'EUR',
        descripcion: req.body.descripcion,
        fecha: req.body.fecha ?? new Date().toISOString(),
        registradoPor: req.body.registradoPor,
      },
    };

    const result = await handler.registrarGasto(command);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  });

  /**
   * POST /transacciones/ingresos - Registrar un ingreso
   */
  router.post('/ingresos', async (req: Request, res: Response) => {
    const command: RegistrarIngreso = {
      commandId: uuidv4(),
      commandType: 'RegistrarIngreso',
      issuedAt: new Date(),
      data: {
        transaccionId: uuidv4(),
        familiaId: req.body.familiaId,
        monto: req.body.monto,
        moneda: req.body.moneda ?? 'EUR',
        descripcion: req.body.descripcion,
        fuente: req.body.fuente,
        fecha: req.body.fecha ?? new Date().toISOString(),
        registradoPor: req.body.registradoPor,
      },
    };

    const result = await handler.registrarIngreso(command);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  });

  return router;
}
