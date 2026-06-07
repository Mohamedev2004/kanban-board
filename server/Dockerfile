# Build stage
FROM golang:1.26-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Copy go mod files only (separate layer for better caching)
COPY go.mod go.sum ./

# Download dependencies (cached layer - won't rebuild if only code changes)
RUN go mod download && go mod verify

# Copy source code only (not vendor, build artifacts, etc.)
COPY cmd ./cmd
COPY config ./config
COPY modules ./modules
COPY routes ./routes
COPY shared ./shared
COPY schedules ./schedules
COPY setup ./setup
COPY templates ./templates

# Build the application (minimal binary with stripped symbols)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -X main.version=1.0.0" \
    -a -installsuffix cgo \
    -o server ./cmd/main.go

# Production stage
FROM alpine:3.21

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata curl

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/server .

# Copy templates if needed
COPY --from=builder /app/templates ./templates

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application
CMD ["./server"]
