# Docker Deployment Guide

This guide explains how to build and deploy the Project Tracker application using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- Supabase project with credentials

## Quick Start

### 1. Environment Variables

Ensure your `.env` file contains the Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`

## Manual Docker Build

If you prefer to build manually without docker-compose:

### Build the Image

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t project-tracker:latest \
  .
```

### Run the Container

```bash
docker run -d \
  --name project-tracker \
  -p 3000:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  project-tracker:latest
```

## Integration with Existing Docker Compose

If you want to integrate this into your existing `home/midnight-platform/docker-compose.yml`:

```yaml
services:
  project-tracker:
    build:
      context: ../3rd-party-modules/dockerfile
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
        GIT_REPO_NAME: project-tracker
    container_name: project-tracker
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    networks:
      - midnight-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

## Available Endpoints

- **Application**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **Build Version**: `http://localhost:3000/build-version`

## File Structure

```
project/
├── Dockerfile              # Multi-stage Docker build configuration
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Nginx web server configuration
├── docker-entrypoint.sh   # Container startup script
├── .dockerignore          # Files to exclude from Docker build
└── .env                   # Environment variables (not committed)
```

## Production Deployment

### Using Docker Compose

1. Copy your production `.env` file to the server
2. Run:
   ```bash
   docker-compose up -d
   ```

### Using Docker Swarm or Kubernetes

The Dockerfile is compatible with orchestration platforms. Health checks are configured for:
- Liveness probe: `/health`
- Readiness probe: `/health`

### Behind a Reverse Proxy

If running behind Nginx or another reverse proxy:

```nginx
location /project-tracker/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Troubleshooting

### Container fails to start

Check logs:
```bash
docker-compose logs project-tracker
```

### Application shows database errors

1. Verify Supabase credentials in `.env`
2. Ensure database migrations have been applied (see DATABASE_SETUP.md)
3. Check network connectivity to Supabase

### Build fails

Clear Docker cache and rebuild:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Health check fails

Access the health endpoint directly:
```bash
curl http://localhost:3000/health
```

Should return: `healthy`

## Performance Tuning

### Nginx Worker Processes

Edit `nginx.conf` to adjust worker processes based on CPU cores:
```nginx
worker_processes auto;  # Automatically detects CPU cores
```

### Gzip Compression

Already enabled in `nginx.conf` for optimal performance.

### Memory Limits

Add memory limits in docker-compose.yml:
```yaml
services:
  project-tracker:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## Security

- The Dockerfile uses non-root nginx user
- Security headers are configured in nginx.conf
- Health check endpoint doesn't expose sensitive information
- Build-time secrets (Supabase keys) are embedded during build and not exposed at runtime

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or force rebuild
docker-compose build --no-cache
docker-compose up -d
```
