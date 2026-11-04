# syntax=docker/dockerfile:1

# ===================================================
# Stage 1: Base image with native build dependencies
# ===================================================
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install native compilation dependencies required by better-sqlite3 and argon2
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ===================================================
# Stage 2: Install dependencies with npm ci
# ===================================================
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ===================================================
# Stage 3: Build the Next.js production application
# ===================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Run prebuild script, Prisma client generation, and Next.js webpack build
RUN npm run build

# ===================================================
# Stage 4: Production runner with non-root security
# ===================================================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Install minimal runtime requirements (curl for healthcheck, openssl for Prisma)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root dedicated system user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy essential files and built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/database ./database
COPY --from=builder /app/scripts ./scripts

# Ensure runtime directories are writable by nextjs user
RUN mkdir -p /app/database /tmp && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
