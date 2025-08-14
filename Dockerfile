############################
# 1. Base image for building
############################

############################
# 1. Build frontend
############################
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend


# Copy package.json (always exists)
COPY frontend/package.json ./
# Copy package-lock.json if it exists (ignore errors if missing)
RUN if [ -f ../frontend/package-lock.json ]; then cp ../frontend/package-lock.json ./package-lock.json; fi

# Install dependencies: use lockfile if present, else fallback to package.json
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi


# Copy frontend source
COPY frontend/ ./

# Build Next.js app
RUN npm run build

############################

############################
# 2. Build backend
############################
FROM node:18-alpine AS backend-build
WORKDIR /app/backend

# Copy package.json (always exists)
COPY backend/package.json ./
# Copy package-lock.json if it exists (ignore errors if missing)
RUN if [ -f ../backend/package-lock.json ]; then cp ../backend/package-lock.json ./package-lock.json; fi

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY backend/ ./

############################
# 3. Production image
############################
FROM node:18-alpine AS runner
WORKDIR /app


# Copy backend package.json (always exists)
COPY backend/package.json backend/
# Copy backend/package-lock.json if it exists (ignore errors if missing)
RUN if [ -f backend/package-lock.json ]; then :; else touch backend/package-lock.json; fi
COPY backend/package-lock.json backend/ || true
# Install only production dependencies
RUN cd backend && if [ -s package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

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
