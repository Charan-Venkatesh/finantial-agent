# Quick Reference: Docker Setup

## One-Command Setup

```bash
./docker-start.sh
```

This script will guide you through the entire setup process.

## Manual Setup

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Generate SECRET_KEY

```bash
openssl rand -hex 32
```

Copy the output and paste it as your SECRET_KEY in .env file.

### 3. Add API Keys (Optional for Testing)

Edit .env and add your API keys:
- `GEMINI_API_KEY` - For AI agent functionality
- `MARKET_DATA_API_KEY` - For real-time stock data
- `NEWS_API_KEY` - For financial news

**Note:** You can use placeholder values for testing, but AI features won't work without valid keys.

### 4. Start Services

```bash
docker-compose up -d
```

### 5. Check Status

```bash
docker-compose ps
```

You should see:
- `financial_agent_backend` - Backend API
- `financial_agent_frontend_react` - React Frontend

### 6. Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend-react

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart backend only
docker-compose restart backend

# Restart frontend only
docker-compose restart frontend-react
```

### Stop Services

```bash
docker-compose down
```

### Rebuild After Changes

```bash
# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Clean rebuild (if having issues)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Access Container Shell

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend-react sh
```

## Architecture

```
Browser (localhost:3000)
    ↓
Nginx (port 80)
    ├─→ /api/* → Backend (port 8000)
    ├─→ /ws/*  → Backend WebSocket
    └─→ /*     → React SPA

Docker Network:
    - backend: FastAPI + SQLite
    - frontend-react: Nginx + React
```

## Environment Variables

### Backend (.env)

```bash
# Database (SQLite by default)
DATABASE_URL=sqlite+aiosqlite:///./test.db

# Security (REQUIRED - must be 32+ characters)
SECRET_KEY=<generate-with-openssl-rand-hex-32>

# API Keys (optional for testing, required for full functionality)
GEMINI_API_KEY=your-key-here
MARKET_DATA_API_KEY=your-key-here
NEWS_API_KEY=your-key-here
```

### Frontend (.env)

For Docker deployment, leave empty (uses nginx proxy):
```bash
VITE_API_BASE_URL=
```

For local development:
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

### Cannot Connect to Backend

1. Check if backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Test backend directly: `curl http://localhost:8000/health`
4. Test through proxy: `curl http://localhost:3000/api/health`

### Port Already in Use

Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:80"   # Frontend: use 3001 instead of 3000
  - "8001:8000" # Backend: use 8001 instead of 8000
```

### Authentication Fails

1. Verify SECRET_KEY in .env is at least 32 characters
2. Rebuild: `docker-compose down && docker-compose build && docker-compose up -d`

### See Full Troubleshooting Guide

For detailed troubleshooting, see [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd react-frontend
npm install
npm run dev
```

Access at http://localhost:5173

## Production Deployment

1. Use strong SECRET_KEY (32+ characters)
2. Set `ENVIRONMENT=production` in .env
3. Use external database (PostgreSQL/MySQL instead of SQLite)
4. Configure SSL/TLS in nginx
5. Set up proper CORS origins
6. Enable monitoring and logging
7. Regular backups of database

## Getting Help

1. **Check logs**: `docker-compose logs -f`
2. **Read troubleshooting guide**: [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)
3. **Test components**: Backend at http://localhost:8000/docs
4. **Open issue**: Include logs and error messages

## API Keys

Get your API keys from:
- **Gemini**: https://makersuite.google.com/app/apikey
- **Finnhub**: https://finnhub.io/register
- **News API**: https://newsapi.org/register
