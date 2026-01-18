import { CommandOf, CommandResult } from '../../shared/types';
import { Presupuesto, LimiteCategoria } from '../../domain/presupuesto';
import { EventSourcedRepository } from '../../infrastructure/eventstore';

/**
 * Datos para crear un presupuesto
 */
export interface CrearPresupuestoData {
  presupuestoId: string;
  familiaId: string;
  nombre: string;
  moneda: string;
  periodoInicio: string;
  periodoFin: string;
  limites: LimiteCategoria[];
}

/**
 * Comando para crear un nuevo presupuesto
 */
export type CrearPresupuesto = CommandOf<'CrearPresupuesto', CrearPresupuestoData>;

/**
 * Datos para actualizar un limite
 */
export interface ActualizarLimiteData {
  presupuestoId: string;
  categoriaId: string;
  nuevoLimite: number;
}

/**
 * Comando para actualizar el limite de una categoria
 */
export type ActualizarLimite = CommandOf<'ActualizarLimite', ActualizarLimiteData>;

/**
 * Handler para comandos de Presupuesto
 */
export class PresupuestoCommandHandler {
  constructor(private readonly repository: EventSourcedRepository<Presupuesto>) {}

  /**
   * Ejecuta el comando CrearPresupuesto
   */
  async crearPresupuesto(
    command: CrearPresupuesto
  ): Promise<CommandResult<{ presupuestoId: string }>> {
    try {
      const existingPresupuesto = await this.repository.getById(command.data.presupuestoId);

      if (existingPresupuesto) {
        return {
          success: false,
          error: 'Ya existe un presupuesto con ese ID',
        };
      }

      const presupuesto = Presupuesto.crear(
        command.data.presupuestoId,
        command.data.familiaId,
        command.data.nombre,
        command.data.moneda,
        new Date(command.data.periodoInicio),
        new Date(command.data.periodoFin),
        command.data.limites
      );

      await this.repository.save(presupuesto);

      return {
        success: true,
        data: { presupuestoId: presupuesto.id },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Ejecuta el comando ActualizarLimite
   */
  async actualizarLimite(command: ActualizarLimite): Promise<CommandResult<void>> {
    try {
      const presupuesto = await this.repository.getById(command.data.presupuestoId);

      if (!presupuesto) {
        return {
          success: false,
          error: 'Presupuesto no encontrado',
        };
      }

      presupuesto.actualizarLimite(command.data.categoriaId, command.data.nuevoLimite);

      await this.repository.save(presupuesto);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}
