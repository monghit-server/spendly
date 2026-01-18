/**
 * Evento base del dominio.
 * Todos los eventos deben extender esta interfaz.
 */
export interface DomainEvent<T = unknown> {
  /** Identificador unico del evento */
  readonly eventId: string;
  /** Tipo del evento (ej: FamiliaCreada) */
  readonly eventType: string;
  /** Identificador del agregado */
  readonly aggregateId: string;
  /** Tipo del agregado (ej: Familia) */
  readonly aggregateType: string;
  /** Version del agregado despues de aplicar este evento */
  readonly version: number;
  /** Timestamp de cuando ocurrio el evento */
  readonly occurredAt: Date;
  /** Datos especificos del evento */
  readonly data: T;
  /** Metadatos opcionales */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Tipo helper para crear eventos tipados
 */
export type EventOf<TType extends string, TData> = DomainEvent<TData> & {
  readonly eventType: TType;
};
