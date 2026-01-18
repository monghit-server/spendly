# Walletwise - Directivas del Proyecto

## Descripcion

Planificador de presupuesto familiar con arquitectura CQRS y Event Sourcing.

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Backend | Node.js + TypeScript + Express |
| Frontend | React + TypeScript |
| Event Store | EventStoreDB |
| Read Models | PostgreSQL |
| Cache | Redis |
| Contenedores | Docker Compose |

## Arquitectura

- **CQRS**: Separacion estricta de comandos (escritura) y queries (lectura)
- **Event Sourcing**: Estado derivado de eventos inmutables
- Los eventos son la fuente de verdad del sistema
- EventStoreDB para persistencia de eventos
- PostgreSQL para proyecciones/read models
- Redis para cache de queries frecuentes

## Dominios y Agregados

| Agregado | Responsabilidad |
|----------|-----------------|
| Familia | Gestionar unidad familiar y miembros |
| Presupuesto | Definir limites de gasto por categoria |
| Transaccion | Registrar gastos e ingresos |

## Comandos

- `CrearFamilia` - Crea una nueva unidad familiar
- `AñadirMiembro` - Agrega un miembro a la familia
- `CrearPresupuesto` - Define un presupuesto con limites
- `RegistrarGasto` - Registra una transaccion de gasto

## Eventos

- `FamiliaCreada` - Emitido al crear familia
- `MiembroAñadido` - Emitido al agregar miembro
- `PresupuestoCreado` - Emitido al crear presupuesto
- `GastoRegistrado` - Emitido al registrar gasto

## Estructura de Carpetas (Backend)

```
src/
├── domain/           # Agregados y logica de negocio
│   ├── familia/
│   ├── presupuesto/
│   └── transaccion/
├── application/      # Casos de uso
│   ├── commands/     # Command handlers
│   └── queries/      # Query handlers
├── infrastructure/   # Implementaciones externas
│   ├── eventstore/   # EventStoreDB
│   ├── persistence/  # PostgreSQL (read models)
│   └── cache/        # Redis
└── api/              # Express routes y controllers
```

## Flujo de Trabajo Git (GitFlow)

### Ramas principales
- `main` - Codigo en produccion, siempre estable
- `develop` - Rama de integracion para desarrollo

### Ramas de soporte
| Tipo | Prefijo | Origen | Destino | Ejemplo |
|------|---------|--------|---------|---------|
| Feature | `feature/` | develop | develop | `feature/#12-crear-familia` |
| Release | `release/` | develop | main + develop | `release/v1.0.0` |
| Hotfix | `hotfix/` | main | main + develop | `hotfix/#45-fix-login` |
| Bugfix | `bugfix/` | develop | develop | `bugfix/#33-validacion-monto` |

### Flujo de trabajo
1. Crear rama feature desde `develop`: `feature/#<issue>-<descripcion>`
2. Desarrollar y hacer commits descriptivos
3. Crear PR de feature a `develop`
4. Para releases: crear rama `release/vX.Y.Z` desde develop
5. Merge de release a `main` y `develop`
6. Tag en main: `vX.Y.Z`

### Reglas
- Nunca commitear directamente a `main` o `develop`
- PRs requieren revision antes de merge
- El merge de `develop` a `main` es responsabilidad del usuario
- Commits descriptivos en espanol


## Convenciones de Codigo

- **TypeScript strict** habilitado
- Nombres de eventos en espanol y pasado: `FamiliaCreada`, `GastoRegistrado`
- Nombres de comandos en espanol e imperativo: `CrearFamilia`, `RegistrarGasto`
- Handlers separados para comandos y queries
- Documentar funciones publicas con JSDoc

## Testing

- Tests unitarios para agregados y handlers
- Tests de integracion para el event store
- Usar datos de prueba realistas para escenarios de presupuesto familiar

## Seguridad

- No commitear archivos `.env` con credenciales
- Validar todos los inputs en los comandos
- Los eventos no deben contener datos sensibles sin encriptar

## Docker

Servicios en `docker-compose.yml`:
- PostgreSQL (read models)
- Redis (cache)
- EventStoreDB (event store)
