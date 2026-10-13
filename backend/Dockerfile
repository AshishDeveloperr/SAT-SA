# Stage 1: Build dependencies & compile native C++ addons (better-sqlite3)
FROM node:22-alpine AS builder

# Install build tools required for node-gyp / native C++ compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Minimal hardened runtime image
FROM node:22-alpine AS runtime

# Install runtime C++ library required for native node addons
RUN apk add --no-cache libstdc++

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Copy installed production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
