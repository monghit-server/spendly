import { DomainEvent } from './event';

/**
 * Clase base para todos los agregados.
 * Implementa el patron Event Sourcing.
 */
export abstract class AggregateRoot<TState> {
  protected readonly _id: string;
  protected _version: number = 0;
  protected _uncommittedEvents: DomainEvent[] = [];
  protected abstract _state: TState;

  constructor(id: string) {
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  get version(): number {
    return this._version;
  }

  /**
   * Obtiene los eventos no confirmados
   */
  getUncommittedEvents(): DomainEvent[] {
    return [...this._uncommittedEvents];
  }

  /**
   * Limpia los eventos no confirmados despues de persistirlos
   */
  clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  /**
   * Aplica un evento al estado del agregado
   */
  protected abstract applyEvent(event: DomainEvent): void;

  /**
   * Registra y aplica un nuevo evento
   */
  protected raise<T>(eventType: string, data: T, metadata?: Record<string, unknown>): void {
    const event: DomainEvent<T> = {
      eventId: crypto.randomUUID(),
      eventType,
      aggregateId: this._id,
      aggregateType: this.constructor.name,
      version: this._version + 1,
      occurredAt: new Date(),
      data,
      metadata,
    };

    this._version = event.version;
    this._uncommittedEvents.push(event);
    this.applyEvent(event);
  }

  /**
   * Reconstruye el estado del agregado desde eventos historicos
   */
  loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this._version = event.version;
      this.applyEvent(event);
    }
  }
}
