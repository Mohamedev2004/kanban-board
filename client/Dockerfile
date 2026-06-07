# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (including dev dependencies for building)
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy only source code (not node_modules, dist, etc.)
COPY src ./src
COPY public ./public
COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY components.json ./
COPY eslint.config.js ./

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose port
EXPOSE 5173

# Health check (fast startup check: 1s timeout, 2s start-period)
HEALTHCHECK --interval=30s --timeout=5s --start-period=2s --retries=2 \
    CMD curl -sf http://localhost:5173/ > /dev/null || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
