# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de produccion
RUN npm ci --only=production && \
    cp -R node_modules /prod_modules && \
    npm ci

# ================================
# Stage 2: Build
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compilar TypeScript
RUN npm run build

# ================================
# Stage 3: Production
# ================================
FROM node:20-alpine AS production

WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S walletwise -u 1001

# Copiar dependencias de produccion y build
COPY --from=deps /prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Metadata
ENV NODE_ENV=production
ENV PORT=3000

# Usuario no privilegiado
USER walletwise

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/actuator/health || exit 1

CMD ["node", "dist/index.js"]
