import { EventOf } from '../../shared/types';

/**
 * Datos del evento FamiliaCreada
 */
export interface FamiliaCreadaData {
  nombre: string;
  propietarioId: string;
  creadaEn: string;
}

/**
 * Evento emitido cuando se crea una nueva familia
 */
export type FamiliaCreada = EventOf<'FamiliaCreada', FamiliaCreadaData>;

/**
 * Datos del evento MiembroAñadido
 */
export interface MiembroAñadidoData {
  miembroId: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'miembro';
  añadidoEn: string;
}

/**
 * Evento emitido cuando se añade un miembro a la familia
 */
export type MiembroAñadido = EventOf<'MiembroAñadido', MiembroAñadidoData>;

/**
 * Union de todos los eventos de Familia
 */
export type FamiliaEvent = FamiliaCreada | MiembroAñadido;
