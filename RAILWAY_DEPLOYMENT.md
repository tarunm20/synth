# 🚄 Railway Deployment Guide

## Overview

This guide covers deploying the Synth Flashcard application to Railway, a modern platform-as-a-service that simplifies deployment and scaling.

## Prerequisites

- GitHub repository with your project
- Railway account (free tier available)
- Gemini API key from Google AI Studio
- Resend API key for email functionality

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Ensure your repository is pushed to GitHub with all recent changes:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Visit [Railway.app](https://railway.app) and sign up/login
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your synth repository
5. Railway will automatically detect it's a Spring Boot + Node.js project

### 3. Configure Environment Variables

In the Railway dashboard, set these environment variables:

#### For Backend Service:
```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=your_resend_api_key_here

# Security
JWT_SECRET=your_super_secure_jwt_secret_32_plus_characters

# Database (Railway will auto-provision PostgreSQL)
DATABASE_URL=${DATABASE_URL}  # Railway provides this automatically
DATABASE_USERNAME=${PGUSER}    # Railway provides this automatically
DATABASE_PASSWORD=${PGPASSWORD} # Railway provides this automatically

# Email Configuration
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-app-name.railway.app

# Application Settings
SERVER_PORT=8080
LOG_LEVEL=INFO
```

#### For Frontend Service:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app/api
NODE_ENV=production
```

### 4. Add PostgreSQL Database

1. In Railway dashboard, click "New Service"
2. Select "PostgreSQL" from the database options
3. Railway will automatically provision and connect the database
4. The DATABASE_URL will be automatically available to your backend

### 5. Configure Services

Railway should automatically detect both services:
- **Backend**: Spring Boot application (Port 8080)
- **Frontend**: Next.js application (Port 3000)

### 6. Deploy

Railway will automatically deploy when you push to the main branch:

```bash
git push origin main
```

Monitor the deployment in the Railway dashboard.

## 🔧 Configuration Details

### Dockerfile Optimization for Railway

Your existing Dockerfiles are already optimized for Railway deployment. Railway automatically detects:

- **Backend**: Uses the root `Dockerfile`
- **Frontend**: Uses `frontend/Dockerfile.prod`

### Health Checks

Railway will automatically monitor your services using:
- **Backend**: `https://your-backend.railway.app/actuator/health`
- **Frontend**: `https://your-frontend.railway.app/api/health`

### Custom Domain (Optional)

1. In Railway dashboard, go to your frontend service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `FRONTEND_URL` and `RESEND_FROM_EMAIL` environment variables

## 📊 Monitoring & Logs

### View Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs --service backend
railway logs --service frontend
```

### Metrics
Railway provides built-in metrics for:
- CPU usage
- Memory usage
- Request count
- Response times

## 🔒 Security Considerations

### Environment Variables
- All secrets are encrypted at rest
- Variables are only accessible to your services
- Use Railway's built-in secret management

### Database Security
- Database is isolated and only accessible to your services
- Automatic backups are included
- SSL connections are enforced

## 💰 Cost Optimization

### Free Tier Usage
- Railway provides generous free tier usage
- Monitor your usage in the dashboard
- Set up billing alerts

### Resource Optimization
```bash
# In your application.yml, optimize for Railway
spring:
  jpa:
    hibernate:
      ddl-auto: update
  datasource:
    hikari:
      maximum-pool-size: 10  # Reduced for Railway
      connection-timeout: 30000
```

## 🚀 Advanced Features

### Auto-Scaling
Railway automatically scales your services based on demand.

### Zero-Downtime Deployments
Railway ensures zero-downtime deployments by:
1. Building new instances
2. Running health checks
3. Switching traffic only when ready

### Rollback
```bash
# Using Railway CLI
railway rollback --service backend
railway rollback --service frontend
```

## 🔧 Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check logs: `railway logs --service [service-name]`
   - Verify environment variables are set correctly
   - Ensure PORT is set to 8080 for backend, 3000 for frontend

2. **Database Connection Issues**
   - Verify DATABASE_URL is automatically provided
   - Check if PostgreSQL service is running
   - Ensure database credentials are correct

3. **Email Not Sending**
   - Verify RESEND_API_KEY is correct
   - Check RESEND_FROM_EMAIL is set properly
   - Ensure domain is verified in Resend dashboard

4. **CORS Issues**
   - Set FRONTEND_URL to your Railway frontend URL
   - Update CORS configuration in SecurityConfig.java

### Debug Commands
```bash
# Check service status
railway status

# View environment variables
railway variables

# Connect to database
railway connect postgres
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_deck ON study_progress(user_id, deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
```

### Caching
Consider adding Redis for improved performance:
```bash
# In Railway dashboard, add Redis service
# Update your Spring Boot configuration
spring:
  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT}
```

## 🎯 Post-Deployment Checklist

- [ ] All services are running and healthy
- [ ] Database is connected and accessible
- [ ] Email functionality is working
- [ ] File upload is working
- [ ] User registration and login work
- [ ] Flashcard generation is functional
- [ ] Study mode is working correctly
- [ ] Progress tracking is saving properly

## 📞 Support

For Railway-specific issues:
- Check [Railway Documentation](https://docs.railway.app)
- Join [Railway Discord](https://discord.gg/railway)
- Submit issues via Railway dashboard

For application-specific issues:
- Check application logs via Railway dashboard
- Review this deployment guide
- Verify environment variables are set correctly

---

## 🎉 Congratulations!

Your Synth Flashcard application is now deployed on Railway with:
- ✅ Automatic deployments on git push
- ✅ Built-in PostgreSQL database
- ✅ Environment variable management
- ✅ Health monitoring
- ✅ Email functionality with Resend
- ✅ Professional domain support
- ✅ Zero-downtime deployments

**Access your app**: https://your-app-name.railway.app