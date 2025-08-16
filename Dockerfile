
# =============================
# 1. Build Frontend (Next.js)
# =============================
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy dependency files separately for better cache
COPY frontend/package.json ./
# Copy lockfile if it exists (ignore error if missing)
COPY frontend/package-lock.json* ./

# Install all dependencies for build
RUN npm install --omit=dev

# Copy rest of frontend source
COPY frontend/ ./

# Build Next.js app
RUN npm run build

# =============================
# 2. Build Backend (Node.js API)
# =============================
FROM node:18-alpine AS backend-build
WORKDIR /app/backend

# Copy dependency files separately for better cache
COPY backend/package.json ./
# Copy lockfile if it exists (ignore error if missing)
COPY backend/package-lock.json* ./

# Install all dependencies for build
RUN npm install --omit=dev

# Copy rest of backend source
COPY backend/ ./

# =============================
# 3. Production Image (Minimal)
# =============================
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only production dependencies for backend
COPY backend/package.json ./backend/
# Copy lockfile if it exists (ignore error if missing)
COPY backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source (excluding node_modules)
COPY --from=backend-build /app/backend ./backend

# Copy frontend build output only (no source or node_modules)
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json

# Copy shared code if needed
COPY shared/ ./shared/

# Expose the port your app runs on (adjust if needed)
EXPOSE 3000
ENV NODE_ENV=production

# Start the backend server (adjust if you serve frontend statically)
CMD ["node", "backend/server.js"]
