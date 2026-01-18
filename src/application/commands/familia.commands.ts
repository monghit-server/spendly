import { CommandOf, CommandResult } from '../../shared/types';
import { Familia } from '../../domain/familia';
import { EventSourcedRepository } from '../../infrastructure/eventstore';

/**
 * Datos para crear una familia
 */
export interface CrearFamiliaData {
  familiaId: string;
  nombre: string;
  propietarioId: string;
}

/**
 * Comando para crear una nueva familia
 */
export type CrearFamilia = CommandOf<'CrearFamilia', CrearFamiliaData>;

/**
 * Datos para añadir un miembro
 */
export interface AñadirMiembroData {
  familiaId: string;
  miembroId: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'miembro';
}

/**
 * Comando para añadir un miembro a la familia
 */
export type AñadirMiembro = CommandOf<'AñadirMiembro', AñadirMiembroData>;

/**
 * Handler para comandos de Familia
 */
export class FamiliaCommandHandler {
  constructor(private readonly repository: EventSourcedRepository<Familia>) {}

  /**
   * Ejecuta el comando CrearFamilia
   */
  async crearFamilia(command: CrearFamilia): Promise<CommandResult<{ familiaId: string }>> {
    try {
      const existingFamilia = await this.repository.getById(command.data.familiaId);

      if (existingFamilia) {
        return {
          success: false,
          error: 'Ya existe una familia con ese ID',
        };
      }

      const familia = Familia.crear(
        command.data.familiaId,
        command.data.nombre,
        command.data.propietarioId
      );

      await this.repository.save(familia);

      return {
        success: true,
        data: { familiaId: familia.id },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Ejecuta el comando AñadirMiembro
   */
  async añadirMiembro(command: AñadirMiembro): Promise<CommandResult<{ miembroId: string }>> {
    try {
      const familia = await this.repository.getById(command.data.familiaId);

      if (!familia) {
        return {
          success: false,
          error: 'Familia no encontrada',
        };
      }

      familia.añadirMiembro(
        command.data.miembroId,
        command.data.nombre,
        command.data.email,
        command.data.rol
      );

      await this.repository.save(familia);

      return {
        success: true,
        data: { miembroId: command.data.miembroId },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}
