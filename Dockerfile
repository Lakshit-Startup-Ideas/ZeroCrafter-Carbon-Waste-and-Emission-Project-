############################
# 1. Base image for building
############################

############################
# 1. Build frontend
############################
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package.json and package-lock.json separately to avoid errors if lockfile is missing
COPY frontend/package.json ./
COPY frontend/package-lock.json ./

# Install dependencies: use lockfile if present, else fallback to package.json
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy frontend source
COPY frontend/ ./

# Build Next.js app
RUN npm run build

############################
# 2. Build backend
############################
FROM node:18-alpine AS backend-build
WORKDIR /app/backend

COPY backend/package.json ./
COPY backend/package-lock.json ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY backend/ ./

############################
# 3. Production image
############################
FROM node:18-alpine AS runner
WORKDIR /app

# Copy backend package files and install only production dependencies
COPY backend/package.json backend/
COPY backend/package-lock.json backend/
RUN cd backend && if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy backend source
COPY --from=backend-build /app/backend ./

# Copy frontend build output
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json

# Copy shared code if needed
COPY shared/ ./shared/

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
