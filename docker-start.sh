#!/bin/bash

# Financial AI Agent Platform - Docker Startup Script
# This script helps start the application with Docker and handles common issues

set -e

echo "🚀 Financial AI Agent Platform - Docker Startup"
echo "================================================"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to check if port is in use
port_in_use() {
    if command_exists lsof; then
        lsof -i :"$1" &> /dev/null
    elif command_exists netstat; then
        netstat -tuln | grep -q ":$1 "
    else
        # Can't check, assume not in use
        return 1
    fi
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Docker
if ! command_exists docker; then
    echo "❌ Docker is not installed."
    echo "   Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo "✅ Docker is installed"

# Check Docker Compose
if ! command_exists docker-compose && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    echo "   Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo "✅ Docker Compose is installed"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running."
    echo "   Please start Docker and try again."
    exit 1
fi
echo "✅ Docker daemon is running"

echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and configure:"
    echo ""
    echo "   Required API keys:"
    echo "   - SECRET_KEY: Generate a secure random string (min 32 characters)"
    echo "   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"
    echo "   - MARKET_DATA_API_KEY: From Finnhub, Alpaca, or Polygon"
    echo "   - NEWS_API_KEY: From https://newsapi.org/"
    echo ""
    echo "   Optional (you can use placeholder values for testing):"
    echo "   - Database uses SQLite by default (no configuration needed)"
    echo ""
    echo "To generate a SECRET_KEY, run:"
    echo "   openssl rand -hex 32"
    echo ""
    echo "After editing .env, run this script again."
    exit 0
fi

echo "✅ .env file found"
echo ""

# Validate critical environment variables
echo "🔍 Validating configuration..."

# Use safer approach to check .env values
SECRET_KEY_VALUE=$(grep "^SECRET_KEY=" .env | cut -d'=' -f2-)

if [ -z "$SECRET_KEY_VALUE" ] || [ "$SECRET_KEY_VALUE" = "CHANGE-THIS-TO-A-RANDOM-32-CHAR-STRING-USE-openssl-rand-hex-32" ] || [ "${#SECRET_KEY_VALUE}" -lt 32 ]; then
    echo "❌ SECRET_KEY is not properly configured in .env"
    echo "   Generate one with: openssl rand -hex 32"
    exit 1
fi

echo "✅ Configuration looks good"
echo ""

# Check if ports are available
echo "🔌 Checking if ports are available..."
if port_in_use 8000; then
    echo "⚠️  Port 8000 is already in use."
    echo "   Please stop the service using this port or change the port in docker-compose.yml"
    exit 1
fi

if port_in_use 3000; then
    echo "⚠️  Port 3000 is already in use."
    echo "   Please stop the service using this port or change the port in docker-compose.yml"
    exit 1
fi

echo "✅ Ports 3000 and 8000 are available"
echo ""

# Stop any existing containers
if docker-compose ps -q 2>/dev/null | grep -q .; then
    echo "🛑 Stopping existing containers..."
    docker-compose down
    echo "✅ Existing containers stopped"
    echo ""
fi

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check service health
max_attempts=30
attempt=0
backend_healthy=false

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        backend_healthy=true
        break
    fi
    attempt=$((attempt + 1))
    sleep 2
    echo -n "."
done

echo ""

if [ "$backend_healthy" = true ]; then
    echo ""
    echo "✅ Backend is healthy!"
else
    echo ""
    echo "⚠️  Backend might not be ready yet. Checking logs..."
    docker-compose logs backend | tail -20
    echo ""
    echo "Run 'docker-compose logs -f' to view full logs."
fi

# Check if containers are running
running_containers=$(docker-compose ps --services --filter "status=running" 2>/dev/null | wc -l)

if [ "$running_containers" -ge 2 ]; then
    echo ""
    echo "✅ All services are running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   📱 React Frontend:  http://localhost:3000"
    echo "   🔧 Backend API:     http://localhost:8000"
    echo "   📚 API Docs:        http://localhost:8000/docs"
    echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs:          docker-compose logs -f"
    echo "   View backend logs:  docker-compose logs -f backend"
    echo "   View frontend logs: docker-compose logs -f frontend-react"
    echo "   Stop services:      docker-compose down"
    echo "   Restart services:   docker-compose restart"
    echo ""
    echo "🎉 Setup complete! Open http://localhost:3000 in your browser."
    echo "   Create an account and start using the Financial AI Agent!"
    echo ""
else
    echo ""
    echo "❌ Some services failed to start."
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check the logs: docker-compose logs"
    echo "2. Verify .env file has all required API keys"
    echo "3. Ensure ports 3000 and 8000 are not in use"
    echo "4. Try rebuilding: docker-compose build --no-cache"
    echo ""
    exit 1
fi
