# =============================
# Production-Ready Dockerfile
# =============================

# =============================
# 1. Build Frontend (Next.js)
# =============================
FROM node:18-alpine AS frontend-build
WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY frontend/ ./

# Build application
RUN npm run build

# =============================
# 2. Build Backend (Node.js API)
# =============================
FROM node:18-alpine AS backend-build
WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY backend/ ./

# =============================
# 3. Production Runtime
# =============================
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=frontend-build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=frontend-build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=frontend-build --chown=nextjs:nodejs /app/public ./public
COPY --from=backend-build --chown=nextjs:nodejs /app ./backend

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start application
CMD ["node", "server.js"]