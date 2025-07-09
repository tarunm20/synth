# Production Deployment Guide

This guide covers deploying the Synth Flashcard application to production with automatic HTTPS, SSL certificates, and monitoring.

## Prerequisites

- Docker and Docker Compose installed
- A domain name pointing to your server
- Server with ports 80 and 443 open
- At least 2GB RAM and 10GB disk space

## Quick Start

### 1. Configure Environment

```bash
# Copy the production template
cp .env.production .env

# Edit with your actual values
nano .env
```

**Required Configuration:**
```bash
# Your domain (without https://)
DOMAIN=yourdomain.com

# Your email for Let's Encrypt notifications
ACME_EMAIL=your-email@yourdomain.com

# Secure database password (generate a strong one)
DB_PASSWORD=your_super_secure_database_password

# Secure JWT secret (32+ characters)
JWT_SECRET=your_super_secure_jwt_secret_must_be_32_plus_characters

# Your Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Deploy

```bash
# Make script executable (if not already)
chmod +x deploy.sh

# Deploy to production
./deploy.sh
```

### 3. Access Your Application

- **Application**: https://yourdomain.com
- **Traefik Dashboard**: https://traefik.yourdomain.com (if enabled)

## What This Deployment Includes

### 🔒 **Automatic HTTPS**
- Let's Encrypt SSL certificates
- Automatic certificate renewal
- HTTP to HTTPS redirects

### 🚀 **Production Optimizations**
- Optimized Docker builds
- Health checks for all services
- Automatic service restarts
- Production Next.js build

### 🛡️ **Security Features**
- Secure environment variable handling
- Non-root container users
- Security headers
- Database isolation

### 📊 **Monitoring & Logging**
- Health check endpoints
- Docker logs for debugging
- Service status monitoring

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.prod.yml ps

# Restart a specific service
docker compose -f docker-compose.prod.yml restart backend

# Update application (rebuild and restart)
./deploy.sh

# Stop all services
docker compose -f docker-compose.prod.yml down

# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U flashcards_user flashcards_prod > backup.sql
```

## Troubleshooting

### SSL Certificate Issues
If SSL certificates fail to generate:
1. Ensure your domain points to the server
2. Check that ports 80 and 443 are open
3. Verify ACME_EMAIL is set correctly
4. Check Traefik logs: `docker compose -f docker-compose.prod.yml logs traefik`

### Service Won't Start
1. Check service logs: `docker compose -f docker-compose.prod.yml logs [service-name]`
2. Verify environment variables in `.env`
3. Ensure required ports aren't in use
4. Check disk space and memory

### Database Connection Issues
1. Verify database credentials in `.env`
2. Check if PostgreSQL is healthy: `docker compose -f docker-compose.prod.yml ps`
3. Check database logs: `docker compose -f docker-compose.prod.yml logs postgres`

## Scaling and Updates

### Zero-Downtime Updates
The deployment script handles updates safely:
1. Builds new containers
2. Starts new services
3. Health checks ensure services are ready
4. Traefik automatically routes to healthy services

### Scaling Services
To scale backend services:
```bash
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Backup Strategy

### Database Backups
```bash
# Create backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U $DB_USERNAME $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USERNAME $DB_NAME < backup.sql
```

### Volume Backups
```bash
# Backup all data volumes
docker run --rm -v synth_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
docker run --rm -v synth_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz /data
```

## Security Considerations

### Environment Variables
- Never commit `.env` to version control
- Regularly rotate JWT secrets and API keys
- Use strong, unique passwords

### Updates
- Regularly update Docker images
- Monitor security advisories for dependencies
- Keep the host system updated

### Monitoring
- Set up external monitoring for uptime
- Monitor disk space and memory usage
- Review logs regularly for suspicious activity

## Performance Optimization

### For High Traffic
1. Add more backend replicas
2. Consider adding Redis for caching
3. Use a CDN for static assets
4. Optimize database queries

### Resource Limits
Add resource limits to docker-compose.prod.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

## Support

For issues:
1. Check this troubleshooting guide
2. Review Docker logs
3. Check GitHub issues
4. Verify environment configuration

---

**🎉 Your Synth Flashcard application is now production-ready!**