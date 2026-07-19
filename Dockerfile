# ============================================================================
# Stage 1: Install ALL dependencies (dev + prod) for building
# ============================================================================
FROM oven/bun:1-slim AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ============================================================================
# Stage 2: Build the SvelteKit app
# ============================================================================
FROM oven/bun:1-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the SvelteKit app (svelte-adapter-bun outputs to /build)
RUN bun run build

# Prune dev dependencies — keep only production deps for the runtime image
RUN bun install --frozen-lockfile --production --ignore-scripts

# ============================================================================
# Stage 3: Minimal production image
# ============================================================================
FROM oven/bun:1-distroless AS runtime

WORKDIR /app

# Copy only what's needed to run
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Railway injects PORT; the adapter defaults to 3000
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "./build/index.js"]
