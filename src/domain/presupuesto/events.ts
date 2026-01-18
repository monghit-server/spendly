import { EventOf } from '../../shared/types';

/**
 * Representa un limite por categoria
 */
export interface LimiteCategoria {
  categoriaId: string;
  nombre: string;
  limite: number;
}

/**
 * Datos del evento PresupuestoCreado
 */
export interface PresupuestoCreadoData {
  familiaId: string;
  nombre: string;
  moneda: string;
  periodoInicio: string;
  periodoFin: string;
  limites: LimiteCategoria[];
  creadoEn: string;
}

/**
 * Evento emitido cuando se crea un nuevo presupuesto
 */
export type PresupuestoCreado = EventOf<'PresupuestoCreado', PresupuestoCreadoData>;

/**
 * Datos del evento LimiteActualizado
 */
export interface LimiteActualizadoData {
  categoriaId: string;
  limiteAnterior: number;
  limiteNuevo: number;
  actualizadoEn: string;
}

/**
 * Evento emitido cuando se actualiza un limite de categoria
 */
export type LimiteActualizado = EventOf<'LimiteActualizado', LimiteActualizadoData>;

/**
 * Union de todos los eventos de Presupuesto
 */
export type PresupuestoEvent = PresupuestoCreado | LimiteActualizado;
