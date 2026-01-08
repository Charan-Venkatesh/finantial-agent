#!/bin/bash

# Quick Start Script for Financial AI Agent Platform
# This script sets up and runs the React frontend

set -e

echo "🚀 Financial AI Agent - React Frontend Quick Start"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Navigate to react-frontend directory
cd react-frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Update VITE_API_BASE_URL if needed."
else
    echo "✅ .env file already exists"
fi

# Build the application
echo "🔨 Building React application..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  cd react-frontend && npm run dev"
echo ""
echo "To preview the production build, run:"
echo "  cd react-frontend && npm run preview"
echo ""
echo "The application will be available at:"
echo "  - Development: http://localhost:5173"
echo "  - Production Preview: http://localhost:4173"
echo ""
echo "Make sure the backend is running on http://localhost:8000"
echo ""
