import { AggregateRoot, DomainEvent } from '../../shared/types';
import { FamiliaCreadaData, MiembroAñadidoData } from './events';

/**
 * Representa un miembro de la familia
 */
export interface Miembro {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'miembro';
  añadidoEn: Date;
}

/**
 * Estado interno del agregado Familia
 */
export interface FamiliaState {
  nombre: string;
  propietarioId: string;
  miembros: Map<string, Miembro>;
  creadaEn: Date | null;
}

/**
 * Agregado Familia - Gestiona la unidad familiar y sus miembros
 */
export class Familia extends AggregateRoot<FamiliaState> {
  protected _state: FamiliaState = {
    nombre: '',
    propietarioId: '',
    miembros: new Map(),
    creadaEn: null,
  };

  get nombre(): string {
    return this._state.nombre;
  }

  get propietarioId(): string {
    return this._state.propietarioId;
  }

  get miembros(): Miembro[] {
    return Array.from(this._state.miembros.values());
  }

  /**
   * Crea una nueva familia
   */
  static crear(id: string, nombre: string, propietarioId: string): Familia {
    const familia = new Familia(id);

    familia.raise<FamiliaCreadaData>('FamiliaCreada', {
      nombre,
      propietarioId,
      creadaEn: new Date().toISOString(),
    });

    return familia;
  }

  /**
   * Añade un nuevo miembro a la familia
   */
  añadirMiembro(miembroId: string, nombre: string, email: string, rol: 'admin' | 'miembro'): void {
    if (this._state.miembros.has(miembroId)) {
      throw new Error(`El miembro con ID ${miembroId} ya existe en la familia`);
    }

    this.raise<MiembroAñadidoData>('MiembroAñadido', {
      miembroId,
      nombre,
      email,
      rol,
      añadidoEn: new Date().toISOString(),
    });
  }

  /**
   * Verifica si un usuario es miembro de la familia
   */
  esMiembro(miembroId: string): boolean {
    return this._state.miembros.has(miembroId);
  }

  /**
   * Aplica un evento al estado del agregado
   */
  protected applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'FamiliaCreada': {
        const data = event.data as FamiliaCreadaData;
        this._state.nombre = data.nombre;
        this._state.propietarioId = data.propietarioId;
        this._state.creadaEn = new Date(data.creadaEn);
        break;
      }
      case 'MiembroAñadido': {
        const data = event.data as MiembroAñadidoData;
        this._state.miembros.set(data.miembroId, {
          id: data.miembroId,
          nombre: data.nombre,
          email: data.email,
          rol: data.rol,
          añadidoEn: new Date(data.añadidoEn),
        });
        break;
      }
    }
  }
}
