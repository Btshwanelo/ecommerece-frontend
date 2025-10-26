# Docker Setup for E-commerce Frontend

This document explains how to run the Next.js e-commerce frontend application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Environment variables configured (see Environment Setup section)

## Files Overview

- `Dockerfile` - Production-ready multi-stage build
- `Dockerfile.dev` - Development environment with hot reload
- `docker-compose.yml` - Orchestration for both production and development
- `.dockerignore` - Excludes unnecessary files from Docker build context
- `.env.example` - Template for environment variables

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:
   ```bash
   # Required for Payfast integration
   NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_actual_merchant_id
   NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_actual_merchant_key
   NEXT_PUBLIC_PAYFAST_PASSPHRASE=your_actual_passphrase
   
   # API endpoint (adjust for your backend)
   NEXT_PUBLIC_API_BASE_URL=http://your-api-server.com/api/v2
   
   # Authentication (if using NextAuth)
   NEXTAUTH_SECRET=your_secret_key_here
   ```

## Running the Application

### Production Mode

Build and run the production container:

```bash
# Build and start the production service
docker-compose up --build frontend

# Or run in detached mode
docker-compose up -d --build frontend
```

The application will be available at `http://localhost:3000`

### Development Mode

For development with hot reload:

```bash
# Start development service
docker-compose --profile dev up --build frontend-dev

# Or run in detached mode
docker-compose --profile dev up -d --build frontend-dev
```

The development server will be available at `http://localhost:3001`

### Both Services

To run both production and development services:

```bash
docker-compose --profile dev up --build
```

## Docker Commands

### Building Images

```bash
# Build production image
docker build -t ecommerce-frontend .

# Build development image
docker build -f Dockerfile.dev -t ecommerce-frontend-dev .
```

### Running Containers

```bash
# Run production container
docker run -p 3000:3000 --env-file .env ecommerce-frontend

# Run development container
docker run -p 3001:3000 --env-file .env -v $(pwd):/app -v /app/node_modules ecommerce-frontend-dev
```

### Managing Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f frontend

# Execute commands in running container
docker-compose exec frontend sh
```

## Health Checks

The production service includes a health check that verifies the application is responding. You can check the health status:

```bash
# Check health status
docker-compose ps

# View health check logs
docker inspect $(docker-compose ps -q frontend) | grep -A 10 Health
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port mapping in `docker-compose.yml`
2. **Environment variables not loading**: Ensure `.env` file exists and has correct format
3. **Build failures**: Check Docker logs with `docker-compose logs frontend`
4. **Permission issues**: Ensure Docker has proper permissions on your system

### Debugging

```bash
# View detailed build logs
docker-compose build --no-cache --progress=plain frontend

# Access container shell
docker-compose exec frontend sh

# Check container resource usage
docker stats $(docker-compose ps -q)
```

### Cleaning Up

```bash
# Remove all containers and networks
docker-compose down

# Remove all containers, networks, and images
docker-compose down --rmi all

# Remove everything including volumes
docker-compose down -v --rmi all
```

## Production Deployment

For production deployment:

1. Update environment variables for production
2. Use a reverse proxy (nginx) for SSL termination
3. Set up proper logging and monitoring
4. Configure health checks and auto-restart policies
5. Use Docker secrets for sensitive data

### Example Production Override

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  frontend:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_PAYFAST_SANDBOX=false
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

Run with: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

## Security Considerations

- Never commit `.env` files to version control
- Use Docker secrets for sensitive data in production
- Regularly update base images for security patches
- Run containers as non-root users (already configured)
- Use multi-stage builds to minimize attack surface

## Performance Optimization

- The production image uses multi-stage builds for smaller size
- Static assets are optimized during build
- Next.js standalone output reduces dependencies
- Health checks ensure service availability

