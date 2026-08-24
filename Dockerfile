# syntax=docker/dockerfile:1
# base image uses Debian/glibc for native Node modules such as argon2.
 
# Stage 1: Install all dependencies once using lockfile-based, reproducible install.
FROM node:20-bookworm-slim AS deps
WORKDIR /app
 
# Install dependencies using lockfile for deterministic builds
COPY package*.json ./
RUN npm ci --ignore-scripts
 
# Stage 2: Build TypeScript output and remove dev-only dependencies.
FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*
 
# Reuse installed dependencies, then build the app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm rebuild argon2 --build-from-source
RUN PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate
RUN npm run build && npm prune --omit=dev
 
# Stage 3: Create a minimal production image with only runtime artifacts.
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*
 
# Runtime environment variables for production execution.
ENV NODE_ENV=production
ENV PORT=3001
 
# Copy only what is required to run the compiled app.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
 
# Document runtime port and start the server.
EXPOSE 3000
CMD ["node", "dist/index.js"]