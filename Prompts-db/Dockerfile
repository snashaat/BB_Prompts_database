# Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app
RUN mkdir -p app/frontend
COPY app/frontend/package.json ./app/frontend/
RUN cd app/frontend && npm install
COPY app/frontend ./app/frontend
RUN cd app/frontend && npm run build

# Build backend
FROM node:18 AS backend-builder
WORKDIR /app
RUN mkdir -p app/backend
COPY app/backend/package.json ./app/backend/
RUN cd app/backend && npm install --only=production
COPY app/backend ./app/backend

# Final production image
FROM node:18-slim
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/app/frontend/dist ./app/frontend/dist

# Copy backend dependencies and source
COPY --from=backend-builder /app/app/backend ./app/backend

# Create directories for persistent data
RUN mkdir -p /app/data /app/uploads /app/thumbnails

# Set environment variables
ENV DATABASE_PATH=/app/data/database.sqlite
ENV UPLOADS_PATH=/app/uploads
ENV THUMBNAILS_PATH=/app/thumbnails
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "app/backend/src/server.js"]
