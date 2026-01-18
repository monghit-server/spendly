# Walletwise

Family budget planner with CQRS and Event Sourcing.

## Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React + TypeScript
- **Event Store**: EventStoreDB
- **Read Models**: PostgreSQL
- **Cache**: Redis

## Getting Started

```bash
# Iniciar servicios
docker-compose up -d

# Instalar dependencias
npm install

# Desarrollo
npm run dev
```

## Arquitectura

```
src/
├── domain/           # Agregados y logica de negocio
├── application/      # Commands y Queries handlers
├── infrastructure/   # EventStoreDB, PostgreSQL, Redis
└── api/              # Express routes
```
