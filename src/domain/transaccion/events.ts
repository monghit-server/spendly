import { EventOf } from '../../shared/types';

/**
 * Tipo de transaccion
 */
export type TipoTransaccion = 'gasto' | 'ingreso';

/**
 * Datos del evento GastoRegistrado
 */
export interface GastoRegistradoData {
  familiaId: string;
  presupuestoId: string;
  categoriaId: string;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha: string;
  registradoPor: string;
  registradoEn: string;
}

/**
 * Evento emitido cuando se registra un gasto
 */
export type GastoRegistrado = EventOf<'GastoRegistrado', GastoRegistradoData>;

/**
 * Datos del evento IngresoRegistrado
 */
export interface IngresoRegistradoData {
  familiaId: string;
  monto: number;
  moneda: string;
  descripcion: string;
  fuente: string;
  fecha: string;
  registradoPor: string;
  registradoEn: string;
}

/**
 * Evento emitido cuando se registra un ingreso
 */
export type IngresoRegistrado = EventOf<'IngresoRegistrado', IngresoRegistradoData>;

/**
 * Datos del evento TransaccionCategorizada
 */
export interface TransaccionCategorizadaData {
  categoriaAnterior: string | null;
  categoriaNueva: string;
  categorizadoEn: string;
}

/**
 * Evento emitido cuando se categoriza o recategoriza una transaccion
 */
export type TransaccionCategorizada = EventOf<'TransaccionCategorizada', TransaccionCategorizadaData>;

/**
 * Union de todos los eventos de Transaccion
 */
export type TransaccionEvent = GastoRegistrado | IngresoRegistrado | TransaccionCategorizada;
