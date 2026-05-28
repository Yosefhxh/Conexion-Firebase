# Etapa 1: Construcción del entorno y dependencias
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalación limpia de dependencias
RUN npm ci

# Copiar el resto del código de la aplicación
COPY . .

# Construcción de la versión web/producción de la app Expo
RUN npm run build --if-present

# Etapa 2: Entorno de ejecución seguro (Producción)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# CORRECCIÓN: Sintaxis nativa de Alpine Linux para manejo de usuarios del sistema
RUN addgroup -g 1001 -S nodejs && adduser -S -G nodejs -u 1001 nestuser

COPY package*.json ./
RUN npm ci --only=production

# Copiar artefactos desde la etapa de compilación
COPY --from=builder /app ./

USER nestuser

EXPOSE 19000
CMD ["npm", "start"]