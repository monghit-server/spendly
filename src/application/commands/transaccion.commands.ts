import { CommandOf, CommandResult } from '../../shared/types';
import { Transaccion } from '../../domain/transaccion';
import { EventSourcedRepository } from '../../infrastructure/eventstore';

/**
 * Datos para registrar un gasto
 */
export interface RegistrarGastoData {
  transaccionId: string;
  familiaId: string;
  presupuestoId: string;
  categoriaId: string;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha: string;
  registradoPor: string;
}

/**
 * Comando para registrar un nuevo gasto
 */
export type RegistrarGasto = CommandOf<'RegistrarGasto', RegistrarGastoData>;

/**
 * Datos para registrar un ingreso
 */
export interface RegistrarIngresoData {
  transaccionId: string;
  familiaId: string;
  monto: number;
  moneda: string;
  descripcion: string;
  fuente: string;
  fecha: string;
  registradoPor: string;
}

/**
 * Comando para registrar un nuevo ingreso
 */
export type RegistrarIngreso = CommandOf<'RegistrarIngreso', RegistrarIngresoData>;

/**
 * Handler para comandos de Transaccion
 */
export class TransaccionCommandHandler {
  constructor(private readonly repository: EventSourcedRepository<Transaccion>) {}

  /**
   * Ejecuta el comando RegistrarGasto
   */
  async registrarGasto(
    command: RegistrarGasto
  ): Promise<CommandResult<{ transaccionId: string }>> {
    try {
      const transaccion = Transaccion.registrarGasto(
        command.data.transaccionId,
        command.data.familiaId,
        command.data.presupuestoId,
        command.data.categoriaId,
        command.data.monto,
        command.data.moneda,
        command.data.descripcion,
        new Date(command.data.fecha),
        command.data.registradoPor
      );

      await this.repository.save(transaccion);

      return {
        success: true,
        data: { transaccionId: transaccion.id },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Ejecuta el comando RegistrarIngreso
   */
  async registrarIngreso(
    command: RegistrarIngreso
  ): Promise<CommandResult<{ transaccionId: string }>> {
    try {
      const transaccion = Transaccion.registrarIngreso(
        command.data.transaccionId,
        command.data.familiaId,
        command.data.monto,
        command.data.moneda,
        command.data.descripcion,
        command.data.fuente,
        new Date(command.data.fecha),
        command.data.registradoPor
      );

      await this.repository.save(transaccion);

      return {
        success: true,
        data: { transaccionId: transaccion.id },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}
