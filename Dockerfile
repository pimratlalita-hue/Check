# ==========================================
# Multi-Stage Hardened Production Dockerfile
# Graduate Thesis Management & Tracking (GTMTS)
# ==========================================

# Stage 1: Install dependencies based on package-lock.json
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts* ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build the application and generate Prisma client
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV AUTH_SECRET="build-secret-dummy-min-16-characters"
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"

RUN npx prisma generate
RUN npm run build

# Stage 3: Minimal hardened production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies for Prisma engine, network readiness, and healthcheck
RUN apk add --no-cache libc6-compat openssl curl netcat-openbsd bash && \
    npm install -g prisma@6.19.3

# Security: Dedicated unprivileged system user & group (Least Privilege)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations for runtime container migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Run as non-root user
USER nextjs

EXPOSE 3010

# Automated container health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD curl -f http://localhost:3010/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
