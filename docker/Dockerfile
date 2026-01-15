# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- Build ----
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- Runtime ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# Copy standalone build + static assets
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Security: drop root
RUN adduser -D nextjs && chown -R nextjs /app
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]