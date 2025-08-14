############################
# 1. Base image for building
############################
FROM node:18-alpine AS base

WORKDIR /app

############################
# 2. Install root dependencies (for monorepo scripts)
############################
COPY package.json package-lock.json ./
RUN npm install

############################
# 3. Build frontend
############################
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy only frontend package files for better cache
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build Next.js app (needs devDependencies)
RUN npm run build

############################
# 4. Build backend
############################
FROM node:18-alpine AS backend-build

WORKDIR /app/backend

# Copy only backend package files for better cache
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Copy backend source
COPY backend/ ./

############################
# 5. Production image
############################
FROM node:18-alpine AS runner

WORKDIR /app

# Install only production dependencies for backend
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY --from=backend-build /app/backend ./

# Copy frontend build output to backend's public directory (adjust as needed)
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json

# Copy shared code if needed
COPY shared/ ./shared/

# Expose backend port
EXPOSE 5000

# Set environment variables (can be overridden at runtime)
ENV NODE_ENV=production

# Start backend server
CMD ["node", "backend/server.js"]
