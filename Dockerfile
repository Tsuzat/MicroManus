# ──────────────────────────────────────────────────────────────
# MicroManus — Railway Dockerfile (Bun + Playwright Chromium)
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Build ───────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json bun.lock ./

# Install ALL dependencies (dev + prod) for the build step
RUN bun install --frozen-lockfile

# Copy source code and build
COPY . .
RUN bun --bun run build

# ── Stage 2: Production ─────────────────────────────────────
FROM oven/bun:1-debian AS production

WORKDIR /app

# Install Playwright's Chromium system dependencies + Chromium itself.
# Playwright needs these OS-level libraries to run headless Chrome.
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Playwright deps (fonts, graphics, sandbox)
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 libx11-xcb1 \
    # Fonts for proper PDF text rendering
    fonts-liberation fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Install Playwright Chromium browser binary
RUN bunx playwright install chromium

# Copy the built SvelteKit app from builder stage
COPY --from=builder /app/build ./build

# Bun adapter serves from the build directory
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "./build"]
