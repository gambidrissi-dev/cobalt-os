# Étape 1 : Construction
FROM node:22.13-slim AS builder

# Installation d'OpenSSL (Indispensable pour Prisma)
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances (y compris Prisma)
RUN npm ci

# Copie du reste du code
COPY . .

# Génération du client Prisma et Build du projet Next.js
# On désactive la télémétrie Next.js pour le build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN npm run build

# Étape 2 : Exécution
FROM node:22.13-slim AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Installation d'OpenSSL dans l'image finale
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/next.config.ts ./next.config.ts || true
COPY --from=builder /app/next.config.js ./next.config.js || true
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Lancement de l'application
CMD ["npm", "start"]