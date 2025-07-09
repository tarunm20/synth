#!/bin/bash

# Production deployment script for Synth Flashcard App
set -e

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy .env.production to .env and configure your values:"
    echo "   cp .env.production .env"
    echo "   # Edit .env with your actual values"
    exit 1
fi

# Check required environment variables
source .env
required_vars=("DOMAIN" "ACME_EMAIL" "DB_PASSWORD" "JWT_SECRET" "GEMINI_API_KEY")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set in .env"
        exit 1
    fi
done

echo "✅ Environment configuration validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker compose -f docker-compose.prod.yml ps

# Show logs for debugging
echo "📋 Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=10

echo ""
echo "🎉 Deployment completed!"
echo "📡 Your application should be available at: https://${DOMAIN}"
echo "🔒 SSL certificates will be automatically obtained from Let's Encrypt"
echo ""
echo "📊 To monitor logs: docker compose -f docker-compose.prod.yml logs -f"
echo "🔄 To update: ./deploy.sh"
echo "🛑 To stop: docker compose -f docker-compose.prod.yml down"