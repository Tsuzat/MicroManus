# ──────────────────────────────────────────────────────────────
# MicroManus — Railway Dockerfile (Bun + Playwright Chromium)
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Build ───────────────────────────────────────────
FROM oven/bun:1-debian AS builder

WORKDIR /app

# better-sqlite3 (transitive devDep from drizzle-kit/better-auth CLI)
# needs python3 + build tools for node-gyp compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests first for better layer caching
COPY package.json bun.lock ./

# Install ALL dependencies (dev + prod) for the build step
RUN bun install --frozen-lockfile

# Copy source code and build
COPY . .
# Copy example env for build
RUN cp .env.example .env
RUN bun --bun run build

# ── Stage 2: Production ─────────────────────────────────────
FROM oven/bun:1-debian AS production

WORKDIR /app

# Playwright Chromium system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 libx11-xcb1 \
    fonts-liberation fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package.json bun.lock ./

# Install production dependencies only (no better-sqlite3 here)
RUN bun install --frozen-lockfile --production

# Install Playwright Chromium browser binary
RUN bunx playwright install chromium

# Copy the built SvelteKit app from builder stage
COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "./build"]
