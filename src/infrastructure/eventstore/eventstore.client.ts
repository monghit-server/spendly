import {
  EventStoreDBClient,
  jsonEvent,
  JSONEventType,
  StreamNotFoundError,
  NO_STREAM,
  FORWARDS,
  START,
} from '@eventstore/db-client';
import { DomainEvent } from '../../shared/types';

export interface EventStoreConfig {
  host: string;
  port: number;
  insecure: boolean;
}

/**
 * Cliente para interactuar con EventStoreDB
 */
export class EventStoreClient {
  private client: EventStoreDBClient;

  constructor(config: EventStoreConfig) {
    const connectionString = config.insecure
      ? `esdb://${config.host}:${config.port}?tls=false`
      : `esdb://${config.host}:${config.port}`;

    this.client = EventStoreDBClient.connectionString(connectionString);
  }

  /**
   * Genera el nombre del stream para un agregado
   */
  private getStreamName(aggregateType: string, aggregateId: string): string {
    return `${aggregateType}-${aggregateId}`;
  }

  /**
   * Persiste eventos en el stream del agregado
   */
  async appendEvents(
    aggregateType: string,
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const streamName = this.getStreamName(aggregateType, aggregateId);

    const eventsToAppend = events.map((event) =>
      jsonEvent({
        type: event.eventType,
        data: event.data as JSONEventType['data'],
        metadata: {
          eventId: event.eventId,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          version: event.version,
          occurredAt: event.occurredAt.toISOString(),
          ...event.metadata,
        },
      })
    );

    const expectedRevision = expectedVersion === 0 ? NO_STREAM : BigInt(expectedVersion - 1);

    await this.client.appendToStream(streamName, eventsToAppend, {
      expectedRevision,
    });
  }

  /**
   * Lee todos los eventos de un agregado
   */
  async readEvents(aggregateType: string, aggregateId: string): Promise<DomainEvent[]> {
    const streamName = this.getStreamName(aggregateType, aggregateId);
    const events: DomainEvent[] = [];

    try {
      const readResult = this.client.readStream(streamName, {
        direction: FORWARDS,
        fromRevision: START,
      });

      for await (const resolvedEvent of readResult) {
        if (!resolvedEvent.event) continue;

        const metadata = resolvedEvent.event.metadata as Record<string, unknown>;

        events.push({
          eventId: metadata['eventId'] as string,
          eventType: resolvedEvent.event.type,
          aggregateId: metadata['aggregateId'] as string,
          aggregateType: metadata['aggregateType'] as string,
          version: metadata['version'] as number,
          occurredAt: new Date(metadata['occurredAt'] as string),
          data: resolvedEvent.event.data,
          metadata,
        });
      }
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        return [];
      }
      throw error;
    }

    return events;
  }

  /**
   * Cierra la conexion con EventStoreDB
   */
  async close(): Promise<void> {
    await this.client.dispose();
  }
}
