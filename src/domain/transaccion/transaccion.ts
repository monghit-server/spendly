import { AggregateRoot, DomainEvent } from '../../shared/types';
import {
  TipoTransaccion,
  GastoRegistradoData,
  IngresoRegistradoData,
  TransaccionCategorizadaData,
} from './events';

/**
 * Estado interno del agregado Transaccion
 */
export interface TransaccionState {
  tipo: TipoTransaccion | null;
  familiaId: string;
  presupuestoId: string | null;
  categoriaId: string | null;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha: Date | null;
  registradoPor: string;
  registradoEn: Date | null;
}

/**
 * Agregado Transaccion - Registra gastos e ingresos
 */
export class Transaccion extends AggregateRoot<TransaccionState> {
  protected _state: TransaccionState = {
    tipo: null,
    familiaId: '',
    presupuestoId: null,
    categoriaId: null,
    monto: 0,
    moneda: 'EUR',
    descripcion: '',
    fecha: null,
    registradoPor: '',
    registradoEn: null,
  };

  get tipo(): TipoTransaccion | null {
    return this._state.tipo;
  }

  get familiaId(): string {
    return this._state.familiaId;
  }

  get monto(): number {
    return this._state.monto;
  }

  get categoriaId(): string | null {
    return this._state.categoriaId;
  }

  /**
   * Registra un nuevo gasto
   */
  static registrarGasto(
    id: string,
    familiaId: string,
    presupuestoId: string,
    categoriaId: string,
    monto: number,
    moneda: string,
    descripcion: string,
    fecha: Date,
    registradoPor: string
  ): Transaccion {
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    const transaccion = new Transaccion(id);

    transaccion.raise<GastoRegistradoData>('GastoRegistrado', {
      familiaId,
      presupuestoId,
      categoriaId,
      monto,
      moneda,
      descripcion,
      fecha: fecha.toISOString(),
      registradoPor,
      registradoEn: new Date().toISOString(),
    });

    return transaccion;
  }

  /**
   * Registra un nuevo ingreso
   */
  static registrarIngreso(
    id: string,
    familiaId: string,
    monto: number,
    moneda: string,
    descripcion: string,
    fuente: string,
    fecha: Date,
    registradoPor: string
  ): Transaccion {
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    const transaccion = new Transaccion(id);

    transaccion.raise<IngresoRegistradoData>('IngresoRegistrado', {
      familiaId,
      monto,
      moneda,
      descripcion,
      fuente,
      fecha: fecha.toISOString(),
      registradoPor,
      registradoEn: new Date().toISOString(),
    });

    return transaccion;
  }

  /**
   * Cambia la categoria de la transaccion
   */
  categorizar(nuevaCategoriaId: string): void {
    if (this._state.tipo !== 'gasto') {
      throw new Error('Solo los gastos pueden ser categorizados');
    }

    this.raise<TransaccionCategorizadaData>('TransaccionCategorizada', {
      categoriaAnterior: this._state.categoriaId,
      categoriaNueva: nuevaCategoriaId,
      categorizadoEn: new Date().toISOString(),
    });
  }

  /**
   * Aplica un evento al estado del agregado
   */
  protected applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'GastoRegistrado': {
        const data = event.data as GastoRegistradoData;
        this._state.tipo = 'gasto';
        this._state.familiaId = data.familiaId;
        this._state.presupuestoId = data.presupuestoId;
        this._state.categoriaId = data.categoriaId;
        this._state.monto = data.monto;
        this._state.moneda = data.moneda;
        this._state.descripcion = data.descripcion;
        this._state.fecha = new Date(data.fecha);
        this._state.registradoPor = data.registradoPor;
        this._state.registradoEn = new Date(data.registradoEn);
        break;
      }
      case 'IngresoRegistrado': {
        const data = event.data as IngresoRegistradoData;
        this._state.tipo = 'ingreso';
        this._state.familiaId = data.familiaId;
        this._state.monto = data.monto;
        this._state.moneda = data.moneda;
        this._state.descripcion = data.descripcion;
        this._state.fecha = new Date(data.fecha);
        this._state.registradoPor = data.registradoPor;
        this._state.registradoEn = new Date(data.registradoEn);
        break;
      }
      case 'TransaccionCategorizada': {
        const data = event.data as TransaccionCategorizadaData;
        this._state.categoriaId = data.categoriaNueva;
        break;
      }
    }
  }
}
