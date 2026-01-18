import { AggregateRoot, DomainEvent } from '../../shared/types';
import { EventStoreClient } from './eventstore.client';

/**
 * Interfaz para repositorios de agregados
 */
export interface Repository<T extends AggregateRoot<unknown>> {
  save(aggregate: T): Promise<void>;
  getById(id: string): Promise<T | null>;
}

/**
 * Tipo para constructores de agregados
 */
export type AggregateConstructor<T extends AggregateRoot<unknown>> = new (id: string) => T;

/**
 * Repositorio base que utiliza Event Sourcing
 */
export class EventSourcedRepository<T extends AggregateRoot<unknown>> implements Repository<T> {
  constructor(
    private readonly eventStore: EventStoreClient,
    private readonly aggregateType: string,
    private readonly AggregateClass: AggregateConstructor<T>
  ) {}

  /**
   * Persiste los eventos no confirmados del agregado
   */
  async save(aggregate: T): Promise<void> {
    const uncommittedEvents = aggregate.getUncommittedEvents();

    if (uncommittedEvents.length === 0) {
      return;
    }

    const expectedVersion = aggregate.version - uncommittedEvents.length;

    await this.eventStore.appendEvents(
      this.aggregateType,
      aggregate.id,
      uncommittedEvents,
      expectedVersion
    );

    aggregate.clearUncommittedEvents();
  }

  /**
   * Reconstruye un agregado desde sus eventos
   */
  async getById(id: string): Promise<T | null> {
    const events = await this.eventStore.readEvents(this.aggregateType, id);

    if (events.length === 0) {
      return null;
    }

    const aggregate = new this.AggregateClass(id);
    aggregate.loadFromHistory(events);

    return aggregate;
  }
}
