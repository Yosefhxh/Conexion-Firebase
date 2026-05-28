# Estapa 1: Construcción del entorno y dependencias
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalación limpia de dependencias (ignora scripts maliciosos de desarrollo)
RUN npm ci

# Copiar el resto del código de la aplicación
COPY . .

# Construcción de la versión web/producción de la app Expo
RUN npm run build --if-present

# Etapa 2: Entorno de ejecución seguro (Producción)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crear un usuario sin privilegios de root para mitigar escalada de privilegios
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs --create-home nestuser

COPY package*.json ./
RUN npm ci --only=production

# Copiar artefactos desde la etapa de compilación
COPY --from=builder /app ./

USER nestuser

EXPOSE 19000
CMD ["npm", "start"]