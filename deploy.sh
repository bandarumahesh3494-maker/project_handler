#!/bin/bash

# Project Tracker - Quick Deployment Script
# This script helps you quickly build and deploy the application

set -e

echo "=========================================="
echo "Project Tracker - Deployment Script"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ .env file created"
        echo ""
        echo "⚠️  IMPORTANT: Edit .env and add your Supabase credentials!"
        echo "   Then run this script again."
        exit 1
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Load environment variables
source .env

# Verify Supabase credentials
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase credentials not configured in .env"
    echo "   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✓ Environment variables loaded"
echo "✓ Supabase URL: $VITE_SUPABASE_URL"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✓ Docker is installed"
echo ""

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker Compose is available"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Build and start the application"
echo "2) Stop the application"
echo "3) Rebuild (no cache) and start"
echo "4) View logs"
echo "5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "Building and starting the application..."
        $DOCKER_COMPOSE up -d --build
        echo ""
        echo "✓ Application started!"
        echo ""
        echo "Access the application at: http://localhost:3000"
        echo "Health check: http://localhost:3000/health"
        echo ""
        echo "View logs: $DOCKER_COMPOSE logs -f"
        ;;
    2)
        echo ""
        echo "Stopping the application..."
        $DOCKER_COMPOSE down
        echo "✓ Application stopped"
        ;;
    3)
        echo ""
        echo "Rebuilding (no cache) and starting..."
        $DOCKER_COMPOSE build --no-cache
        $DOCKER_COMPOSE up -d
        echo ""
        echo "✓ Application rebuilt and started!"
        echo ""
        echo "Access the application at: http://localhost:3000"
        ;;
    4)
        echo ""
        echo "Showing logs (Ctrl+C to exit)..."
        $DOCKER_COMPOSE logs -f
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac
