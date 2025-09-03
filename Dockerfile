# =============================
# 1. Build Frontend (Next.js)
# =============================
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy dependency files first (cache layer)
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./

# Install ALL dependencies (dev included, needed for Tailwind/PostCSS build)
RUN npm install

# Copy the rest of frontend source
COPY frontend/ ./

# Build Next.js app (generates .next + static assets)
RUN npm run build


# =============================
# 2. Build Backend (Node.js API)
# =============================
FROM node:18-alpine AS backend-build
WORKDIR /app/backend

# Copy dependency files first (cache layer)
COPY backend/package.json ./
COPY backend/package-lock.json* ./

# Install all dependencies (no dev needed for backend)
RUN npm install --omit=dev

# Copy the rest of backend source
COPY backend/ ./


# =============================
# 3. Production Image (Minimal)
# =============================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# --- Backend ---
# Copy backend package files & install only production deps
COPY backend/package.json ./backend/
COPY backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source (built previously, excluding node_modules)
COPY --from=backend-build /app/backend ./backend

# --- Frontend ---
# Copy only Next.js build output (no devDeps or src)
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json

# --- Shared Code ---
COPY shared/ ./shared/

# Expose port (adjust if backend serves frontend)
EXPOSE 3000

# Start backend server
CMD ["node", "backend/server.js"]
