# syntax=docker/dockerfile:1

# Node 26 ships without corepack, so pnpm is installed with npm.
FROM node:26-trixie-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
RUN npm install -g pnpm@12.16.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN npm install -g pnpm@12.16.1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=file:/data/portfolio.db \
    MEDIA_DIR=/data/media

# curl is what Coolify's healthcheck calls inside the container.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# /data belongs to the app user in the image, so an empty named volume mounted there inherits it.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /data/media .next \
  && chown -R nextjs:nodejs /data .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/healthz || exit 1

# Docker sets HOSTNAME to the container id, so it is overridden here rather than with ENV.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
