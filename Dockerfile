# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Supabase
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set environment variables so Vite can read them at build time
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build argument for repository name with default
ARG GIT_REPO_NAME=project-tracker

# Generate build version metadata
RUN echo "{\"buildTime\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"gitRepo\":\"${GIT_REPO_NAME}\",\"nodeVersion\":\"$(node --version)\"}" > /app/BUILD_VERSION_DATA.json

# Build the application
RUN npm run build

# Stage 2: Production server with Nginx
FROM nginx:1.25.3-alpine

# Copy the build version file
COPY --from=builder /app/BUILD_VERSION_DATA.json /usr/share/nginx/html/BUILD_VERSION_DATA.json

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy environment configuration script with explicit path
COPY --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

# Verify the file exists and is executable
RUN ls -la /docker-entrypoint.sh && \
    test -x /docker-entrypoint.sh && \
    echo "Entrypoint script verified successfully"

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Use custom entrypoint to inject runtime environment variables if needed
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
