# Synth Flashcard Generator - Production Deployment Guide

## 🚀 MVP Production Deployment

This guide covers deploying the Synth flashcard application for production use.

## Prerequisites

- Docker and Docker Compose
- Domain name with DNS access
- SSL certificate (Let's Encrypt recommended)
- Gemini API key from Google AI Studio

## 📋 Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
# Backend Environment Variables
GEMINI_API_KEY=your_actual_gemini_api_key_here
JWT_SECRET=generate-a-strong-32-character-secret-key-here
DB_PASSWORD=your_secure_database_password_here

# CORS Configuration (your domain)
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flashcards
DB_USERNAME=postgres

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Application Configuration
LOG_LEVEL=INFO
SERVER_PORT=8080

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### 2. Generate Secure JWT Secret

```bash
# Generate a secure 32-character secret
openssl rand -base64 32
```

### 3. Production Deployment

```bash
# Build and start all services
docker-compose up -d --build

# Check service health
docker-compose ps
```

### 4. Verify Deployment

```bash
# Check backend health
curl https://yourdomain.com/actuator/health

# Check frontend
curl https://yourdomain.com
```

## 🔒 Security Configuration

### HTTPS Setup (Required for Production)

#### Option 1: Let's Encrypt with Nginx

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

3. Add Nginx configuration:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health checks
    location /actuator/health {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### Option 2: Cloudflare (Recommended for MVP)

1. Add your domain to Cloudflare
2. Set SSL mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Update CORS_ALLOWED_ORIGINS to your Cloudflare domain

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirects to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📊 Monitoring Setup

### Application Health Checks

The application includes built-in health endpoints:

- Backend: `https://yourdomain.com/actuator/health`
- Frontend: `https://yourdomain.com/_next/static/health` (basic check)

### Basic Monitoring Script

Create `/opt/synth/monitor.sh`:

```bash
#!/bin/bash

# Check if services are running
if ! curl -f https://yourdomain.com/actuator/health > /dev/null 2>&1; then
    echo "Backend health check failed"
    # Restart backend
    docker-compose restart backend
fi

if ! curl -f https://yourdomain.com > /dev/null 2>&1; then
    echo "Frontend health check failed"
    # Restart frontend
    docker-compose restart frontend
fi
```

Add to crontab:
```bash
# Check every 5 minutes
*/5 * * * * /opt/synth/monitor.sh
```

## 💾 Backup Strategy

### Database Backup

Create `/opt/synth/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/synth/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U postgres flashcards > $BACKUP_DIR/flashcards_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "flashcards_*.sql" -mtime +30 -delete

echo "Database backup completed: flashcards_$DATE.sql"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/synth/backup.sh
```

### File Backup

Include uploaded files if you add file upload features later:
```bash
# In backup.sh, add:
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz ./uploads/
```

## 🔧 Production Configuration

### Docker Compose Override

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./backups:/backups
    
  backend:
    environment:
      SPRING_PROFILES_ACTIVE: production
    restart: always
    
  frontend:
    restart: always
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
    restart: always
```

Deploy with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Performance Optimization

1. **Database Optimization:**
```sql
-- Add database indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_progress_user_deck ON study_progress(user_id, deck_id);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
```

2. **Application Tuning:**
```yaml
# In application.yml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 25
        order_inserts: true
        order_updates: true
  
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

## 🚨 Security Checklist

- [x] JWT secrets configured
- [x] CORS properly restricted
- [x] HTTPS enabled
- [x] Rate limiting implemented
- [x] Input validation active
- [x] Error handling secure
- [x] Security headers enabled
- [x] Database credentials secured
- [ ] Regular security updates
- [ ] Log monitoring setup

## 📝 Maintenance

### Regular Tasks

1. **Weekly:**
   - Check disk space
   - Review error logs
   - Verify backups

2. **Monthly:**
   - Update dependencies
   - Review security logs
   - Test backup restoration

3. **Quarterly:**
   - Security audit
   - Performance review
   - Capacity planning

### Log Management

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Log rotation setup
echo '/var/lib/docker/containers/*/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}' | sudo tee /etc/logrotate.d/docker
```

### Updating the Application

```bash
# 1. Backup database
./backup.sh

# 2. Pull latest changes
git pull origin main

# 3. Rebuild and deploy
docker-compose down
docker-compose up -d --build

# 4. Verify health
curl https://yourdomain.com/actuator/health
```

## 🆘 Troubleshooting

### Common Issues

1. **502 Bad Gateway:**
   - Check if backend is running: `docker-compose ps`
   - Check backend logs: `docker-compose logs backend`

2. **Database Connection Failed:**
   - Verify database is healthy: `docker-compose exec postgres pg_isready`
   - Check credentials in `.env` file

3. **High Memory Usage:**
   - Monitor with: `docker stats`
   - Restart services: `docker-compose restart`

4. **Rate Limiting Errors:**
   - Check Redis status: `docker-compose exec redis redis-cli ping`
   - Review rate limiting logs: `docker-compose logs backend | grep "rate"`

### Emergency Procedures

**Service Down:**
```bash
# Quick restart
docker-compose restart

# Full rebuild
docker-compose down
docker-compose up -d --build
```

**Database Recovery:**
```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres -d flashcards < /backups/flashcards_YYYYMMDD_HHMMSS.sql
```

## 📞 Support

For production issues:

1. Check application logs
2. Verify all services are healthy
3. Review this deployment guide
4. Check the troubleshooting section

## 🎯 Performance Benchmarks

Expected performance for MVP:
- Response time: < 200ms (95th percentile)
- Throughput: > 100 requests/second
- Uptime: > 99.5%
- Database queries: < 50ms average

Monitor these metrics and scale accordingly as your user base grows.

---

This deployment guide covers the essential production setup for the Synth flashcard application MVP. Follow security best practices and monitor your application regularly.