# Docker Troubleshooting Guide

This guide helps resolve common issues when running the Financial AI Agent Platform with Docker.

## Quick Start

Use the automated startup script:
```bash
./docker-start.sh
```

This script will check prerequisites and guide you through any configuration issues.

## Common Issues and Solutions

### 1. Frontend Cannot Connect to Backend

**Symptoms:**
- Login/signup fails with network errors
- API calls return 404 or connection refused
- Browser console shows CORS errors

**Solutions:**

#### Check Docker Network
```bash
# Verify both containers are running
docker-compose ps

# Should show:
# - financial_agent_backend
# - financial_agent_frontend_react
```

#### Check Backend Health
```bash
# Test backend directly
curl http://localhost:8000/health

# Should return: {"status":"healthy",...}
```

#### Check Nginx Proxy
```bash
# View frontend container logs
docker-compose logs frontend-react

# Check if nginx started successfully
docker-compose exec frontend-react nginx -t
```

#### Test API Proxy
```bash
# Test API through frontend proxy
curl http://localhost:3000/api/health

# Should return same as backend health check
```

**Root Cause:** The frontend uses nginx to proxy API requests to the backend. If the nginx configuration is incorrect or the backend container is not reachable, API calls will fail.

**Fix:**
1. Ensure nginx.conf has the correct proxy settings
2. Verify backend container name is `backend` in docker-compose.yml
3. Check that backend is on the same Docker network

### 2. Authentication Errors (401 Unauthorized)

**Symptoms:**
- Cannot login even with correct credentials
- "Incorrect username or password" error
- Token validation fails

**Solutions:**

#### Check SECRET_KEY Configuration
```bash
# Verify SECRET_KEY in .env
grep SECRET_KEY .env

# Should be at least 32 characters and NOT the default value
```

#### Generate New SECRET_KEY
```bash
# Generate a secure key
openssl rand -hex 32

# Update .env file with the new key
# Then rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

#### Check Database
```bash
# Access backend container
docker-compose exec backend sh

# Check if database file exists
ls -la test.db

# Exit container
exit
```

**Root Cause:** The SECRET_KEY is used to sign JWT tokens. If it changes or is not properly set, authentication will fail.

### 3. CORS Errors

**Symptoms:**
- Browser console shows CORS policy errors
- "No 'Access-Control-Allow-Origin' header" messages
- Requests blocked by browser

**Solutions:**

#### Check CORS Configuration
```bash
# View backend logs for CORS issues
docker-compose logs backend | grep -i cors
```

#### Verify Allowed Origins
The backend should allow these origins:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost`
- `http://frontend-react`

#### Restart Backend
```bash
docker-compose restart backend
```

**Root Cause:** CORS (Cross-Origin Resource Sharing) must be properly configured to allow the frontend to make requests to the backend.

### 4. Port Conflicts

**Symptoms:**
- "Port already in use" errors
- Containers fail to start
- Cannot access application on expected ports

**Solutions:**

#### Check Port Usage
```bash
# Check what's using port 8000
lsof -i :8000

# Check what's using port 3000
lsof -i :3000
```

#### Change Ports in docker-compose.yml
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Use 8001 instead of 8000
  
  frontend-react:
    ports:
      - "3001:80"    # Use 3001 instead of 3000
```

**Root Cause:** Other applications may be using the default ports 3000 or 8000.

### 5. Build Failures

**Symptoms:**
- Docker build fails
- "npm install" or "pip install" errors
- Missing dependencies

**Solutions:**

#### Clean Build
```bash
# Remove old images and build from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Check Dockerfiles
Ensure the Dockerfiles have the correct paths:
- Backend: `backend/Dockerfile`
- Frontend: `react-frontend/Dockerfile`

#### Check Internet Connection
Docker needs internet access to download dependencies.

#### View Build Logs
```bash
# Build with output
docker-compose build --progress=plain
```

### 6. Environment Variables Not Working

**Symptoms:**
- API keys not found
- Configuration values not applied
- "API key required" errors

**Solutions:**

#### Verify .env File Location
The .env file should be in the project root (same directory as docker-compose.yml).

#### Check .env File Format
```bash
# Correct format (no spaces around =)
SECRET_KEY=mykey123
GEMINI_API_KEY=myapikey

# Incorrect format
SECRET_KEY = mykey123
GEMINI_API_KEY = myapikey
```

#### Rebuild After .env Changes
```bash
docker-compose down
docker-compose up -d
```

**Note:** For the frontend, environment variables must start with `VITE_` and are embedded at build time.

### 7. Database Issues

**Symptoms:**
- "Database not initialized" errors
- Cannot create users
- SQLAlchemy errors in logs

**Solutions:**

#### Check Database File
```bash
# Check if database file was created
docker-compose exec backend ls -la test.db
```

#### Reinitialize Database
```bash
# Stop containers
docker-compose down

# Remove database volume (if any)
docker volume ls
docker volume rm <volume-name-if-exists>

# Restart (database will be recreated)
docker-compose up -d
```

#### Check Database Logs
```bash
docker-compose logs backend | grep -i database
```

### 8. Frontend Build Errors

**Symptoms:**
- White screen or blank page
- "Module not found" errors
- Build fails during Docker image creation

**Solutions:**

#### Check Node Modules
```bash
# Rebuild frontend with clean cache
docker-compose build --no-cache frontend-react
```

#### Verify package.json
Ensure all dependencies are listed correctly in `react-frontend/package.json`.

#### Check Build Output
```bash
# View frontend build logs
docker-compose logs frontend-react
```

### 9. WebSocket Connection Issues

**Symptoms:**
- Real-time features not working
- WebSocket connection fails
- "WebSocket handshake" errors

**Solutions:**

#### Check Nginx WebSocket Configuration
The nginx.conf should have WebSocket proxy settings for `/ws/` location.

#### Test WebSocket Connection
```bash
# Use a WebSocket testing tool
wscat -c ws://localhost:3000/ws/stream/1
```

### 10. Container Keeps Restarting

**Symptoms:**
- Container status shows "Restarting"
- Application not accessible
- Logs show crash loop

**Solutions:**

#### View Container Logs
```bash
# Check what's causing the crash
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend-react
```

#### Common Causes:
1. **Missing environment variables**: Check .env file
2. **Port conflicts**: Change ports in docker-compose.yml
3. **Configuration errors**: Check application config files
4. **Dependency issues**: Rebuild with `--no-cache`

#### Stop and Inspect
```bash
# Stop containers
docker-compose down

# Start with logs visible
docker-compose up
```

## Debugging Commands

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend-react
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend-react sh
```

### Check Container Status
```bash
docker-compose ps
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Complete Reset
```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

## Getting Help

If you're still experiencing issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify configuration**: Ensure .env file is properly configured
3. **Test components separately**: Test backend directly at http://localhost:8000
4. **Check GitHub issues**: Look for similar problems
5. **Open a new issue**: Include logs and error messages

## API Key Setup

Some features require API keys. Here's where to get them:

- **Gemini API**: https://makersuite.google.com/app/apikey
- **Finnhub API**: https://finnhub.io/register
- **News API**: https://newsapi.org/register

For testing, you can use placeholder values, but AI features will not work without valid keys.

## Network Architecture

Understanding the Docker network setup:

```
Browser (localhost:3000)
    ↓
Nginx (port 80 in container)
    ↓ /api/* → http://backend:8000
    ↓ /ws/* → ws://backend:8000
    ↓ /* → React SPA
Backend (port 8000)
```

The frontend and backend communicate through Docker's internal network, not through localhost. The nginx reverse proxy handles routing requests from the browser to the appropriate service.

## Production Considerations

For production deployment:

1. **Use strong SECRET_KEY**: Generate with `openssl rand -hex 32`
2. **Set ENVIRONMENT=production** in .env
3. **Use proper SSL/TLS**: Add nginx SSL configuration
4. **Use external database**: Replace SQLite with PostgreSQL/MySQL
5. **Configure proper CORS origins**: Update ALLOWED_ORIGINS
6. **Enable rate limiting**: Add nginx rate limiting
7. **Set up monitoring**: Add logging and monitoring services
8. **Backup database**: Regular database backups
9. **Update regularly**: Keep dependencies updated
