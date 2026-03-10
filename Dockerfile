# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./data/budget.db"
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache python3 make g++
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install only production deps (runs postinstall/better-sqlite3 native build)
RUN npm ci --frozen-lockfile --omit=dev

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
