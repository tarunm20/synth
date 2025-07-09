#!/bin/bash

# Configuration validation script
set -e

echo "🔍 Validating production configuration..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.production to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Check required variables
echo "📋 Checking required environment variables..."

required_vars=(
    "DOMAIN"
    "ACME_EMAIL" 
    "DB_PASSWORD"
    "JWT_SECRET"
    "GEMINI_API_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   - %s\n' "${missing_vars[@]}"
    exit 1
fi

# Validate specific requirements
echo "🔐 Validating security requirements..."

# Check JWT secret length
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ JWT_SECRET must be at least 32 characters long"
    exit 1
fi

# Check email format
if [[ ! "$ACME_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    echo "❌ ACME_EMAIL must be a valid email address"
    exit 1
fi

# Check password strength
if [ ${#DB_PASSWORD} -lt 12 ]; then
    echo "⚠️  Warning: DB_PASSWORD should be at least 12 characters for better security"
fi

echo "✅ Configuration validation passed!"
echo ""
echo "📊 Configuration summary:"
echo "   Domain: $DOMAIN"
echo "   Email: $ACME_EMAIL"
echo "   Database: $DB_NAME"
echo "   JWT Secret: ${#JWT_SECRET} characters"
echo "   Database Password: ${#DB_PASSWORD} characters"
echo ""
echo "🚀 Ready for deployment!"