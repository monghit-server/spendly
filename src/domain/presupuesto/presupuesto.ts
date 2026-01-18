import { AggregateRoot, DomainEvent } from '../../shared/types';
import { LimiteCategoria, PresupuestoCreadoData, LimiteActualizadoData } from './events';

/**
 * Estado interno del agregado Presupuesto
 */
export interface PresupuestoState {
  familiaId: string;
  nombre: string;
  moneda: string;
  periodoInicio: Date | null;
  periodoFin: Date | null;
  limites: Map<string, LimiteCategoria>;
  creadoEn: Date | null;
}

/**
 * Agregado Presupuesto - Define limites de gasto por categoria
 */
export class Presupuesto extends AggregateRoot<PresupuestoState> {
  protected _state: PresupuestoState = {
    familiaId: '',
    nombre: '',
    moneda: 'EUR',
    periodoInicio: null,
    periodoFin: null,
    limites: new Map(),
    creadoEn: null,
  };

  get familiaId(): string {
    return this._state.familiaId;
  }

  get nombre(): string {
    return this._state.nombre;
  }

  get moneda(): string {
    return this._state.moneda;
  }

  get limites(): LimiteCategoria[] {
    return Array.from(this._state.limites.values());
  }

  /**
   * Crea un nuevo presupuesto
   */
  static crear(
    id: string,
    familiaId: string,
    nombre: string,
    moneda: string,
    periodoInicio: Date,
    periodoFin: Date,
    limites: LimiteCategoria[]
  ): Presupuesto {
    if (periodoFin <= periodoInicio) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const presupuesto = new Presupuesto(id);

    presupuesto.raise<PresupuestoCreadoData>('PresupuestoCreado', {
      familiaId,
      nombre,
      moneda,
      periodoInicio: periodoInicio.toISOString(),
      periodoFin: periodoFin.toISOString(),
      limites,
      creadoEn: new Date().toISOString(),
    });

    return presupuesto;
  }

  /**
   * Actualiza el limite de una categoria
   */
  actualizarLimite(categoriaId: string, nuevoLimite: number): void {
    const limiteActual = this._state.limites.get(categoriaId);

    if (!limiteActual) {
      throw new Error(`La categoria ${categoriaId} no existe en este presupuesto`);
    }

    if (nuevoLimite < 0) {
      throw new Error('El limite no puede ser negativo');
    }

    this.raise<LimiteActualizadoData>('LimiteActualizado', {
      categoriaId,
      limiteAnterior: limiteActual.limite,
      limiteNuevo: nuevoLimite,
      actualizadoEn: new Date().toISOString(),
    });
  }

  /**
   * Obtiene el limite de una categoria
   */
  obtenerLimite(categoriaId: string): number | null {
    return this._state.limites.get(categoriaId)?.limite ?? null;
  }

  /**
   * Aplica un evento al estado del agregado
   */
  protected applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'PresupuestoCreado': {
        const data = event.data as PresupuestoCreadoData;
        this._state.familiaId = data.familiaId;
        this._state.nombre = data.nombre;
        this._state.moneda = data.moneda;
        this._state.periodoInicio = new Date(data.periodoInicio);
        this._state.periodoFin = new Date(data.periodoFin);
        this._state.creadoEn = new Date(data.creadoEn);

        for (const limite of data.limites) {
          this._state.limites.set(limite.categoriaId, limite);
        }
        break;
      }
      case 'LimiteActualizado': {
        const data = event.data as LimiteActualizadoData;
        const limite = this._state.limites.get(data.categoriaId);
        if (limite) {
          limite.limite = data.limiteNuevo;
        }
        break;
      }
    }
  }
}
