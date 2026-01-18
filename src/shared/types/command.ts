/**
 * Comando base del dominio.
 * Los comandos representan intenciones de modificar el estado.
 */
export interface Command<T = unknown> {
  /** Identificador unico del comando */
  readonly commandId: string;
  /** Tipo del comando (ej: CrearFamilia) */
  readonly commandType: string;
  /** Timestamp de cuando se emitio el comando */
  readonly issuedAt: Date;
  /** Datos especificos del comando */
  readonly data: T;
  /** Metadatos opcionales (ej: userId, correlationId) */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Tipo helper para crear comandos tipados
 */
export type CommandOf<TType extends string, TData> = Command<TData> & {
  readonly commandType: TType;
};

/**
 * Resultado de ejecutar un comando
 */
export interface CommandResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}
