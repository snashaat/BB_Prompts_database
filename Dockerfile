# Multi-stage build for production

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY app/frontend/package*.json ./
RUN npm ci --only=production

# Copy frontend source
COPY app/frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY app/backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY app/backend/ ./

# Stage 3: Production image
FROM node:18-alpine AS production

# Install necessary packages for image processing
RUN apk add --no-cache \
    vips-dev \
    libc6-compat

WORKDIR /app

# Create directories for uploads and thumbnails
RUN mkdir -p uploads thumbnails database

# Copy backend from builder
COPY --from=backend-builder /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3000

CMD ["node", "backend/src/server.js"]
