import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FamiliaCommandHandler, CrearFamilia, AñadirMiembro } from '../../application/commands';

/**
 * Crea las rutas para el agregado Familia
 */
export function createFamiliaRoutes(handler: FamiliaCommandHandler): Router {
  const router = Router();

  /**
   * POST /familias - Crear una nueva familia
   */
  router.post('/', async (req: Request, res: Response) => {
    const command: CrearFamilia = {
      commandId: uuidv4(),
      commandType: 'CrearFamilia',
      issuedAt: new Date(),
      data: {
        familiaId: uuidv4(),
        nombre: req.body.nombre,
        propietarioId: req.body.propietarioId,
      },
    };

    const result = await handler.crearFamilia(command);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  });

  /**
   * POST /familias/:id/miembros - Añadir miembro a una familia
   */
  router.post('/:id/miembros', async (req: Request, res: Response) => {
    const command: AñadirMiembro = {
      commandId: uuidv4(),
      commandType: 'AñadirMiembro',
      issuedAt: new Date(),
      data: {
        familiaId: req.params['id'] ?? '',
        miembroId: uuidv4(),
        nombre: req.body.nombre,
        email: req.body.email,
        rol: req.body.rol ?? 'miembro',
      },
    };

    const result = await handler.añadirMiembro(command);

    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  });

  return router;
}
