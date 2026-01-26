# Multi-stage Production Dockerfile for OpenPortal Frontend

# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (need devDependencies for build step)
RUN npm ci

# Copy source code
COPY . .

# Build-time environment (Vite reads import.meta.env.* at build)
ARG VITE_API_URL
ARG VITE_AUTH_PROVIDER
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_PROVIDER=${VITE_AUTH_PROVIDER}

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
