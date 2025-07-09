# Railway Deployment Checklist for synth.blueturtle.ai

## Pre-Deployment Requirements

- [ ] GitHub repository is up to date with latest code
- [ ] Gemini API key obtained from Google AI Studio
- [ ] Strong JWT secret generated (32+ characters)
- [ ] Access to blueturtle.ai DNS settings
- [ ] Railway account created and connected to GitHub

## Railway Setup Steps

### 1. Create Railway Project
- [ ] Go to railway.app and log in
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select your synth repository
- [ ] Confirm Railway detects both backend and frontend services

### 2. Add PostgreSQL Database
- [ ] Click "New Service" in Railway dashboard
- [ ] Select "PostgreSQL" from database options
- [ ] Verify database is provisioned and connected

### 3. Configure Backend Service Environment Variables
- [ ] `GEMINI_API_KEY` = your_gemini_api_key_here
- [ ] `RESEND_API_KEY` = re_T9VNkF49_PT6i9wiu54JMWb6XKuHeU7Yz
- [ ] `JWT_SECRET` = your_generated_jwt_secret
- [ ] `RESEND_FROM_EMAIL` = noreply@blueturtle.ai
- [ ] `FRONTEND_URL` = https://synth.blueturtle.ai
- [ ] `SERVER_PORT` = 8080
- [ ] `LOG_LEVEL` = INFO
- [ ] `CORS_ALLOWED_ORIGINS` = https://synth.blueturtle.ai
- [ ] `SPRING_PROFILES_ACTIVE` = production

### 4. Configure Frontend Service Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` = https://[backend-service-name].railway.app/api
- [ ] `NODE_ENV` = production

### 5. Custom Domain Setup
- [ ] In Railway frontend service: Settings → Domains → Add "synth.blueturtle.ai"
- [ ] In blueturtle.ai DNS: Add CNAME record (synth → [frontend-service].railway.app)
- [ ] Wait for DNS propagation (usually 5-15 minutes)

### 6. Deployment Verification
- [ ] Both services show "Active" status in Railway dashboard
- [ ] Backend health check works: https://[backend-service].railway.app/actuator/health
- [ ] Frontend loads: https://synth.blueturtle.ai
- [ ] Database connection is working (check backend logs)

## Post-Deployment Testing

### Core Functionality Tests
- [ ] User registration works and sends email confirmation
- [ ] Email confirmation link works correctly
- [ ] User login works with JWT tokens
- [ ] Password reset functionality works via email
- [ ] File upload for flashcard generation works
- [ ] Text input for flashcard generation works
- [ ] Study mode loads and functions correctly
- [ ] AI grading provides feedback and scores
- [ ] Progress tracking saves and resumes correctly
- [ ] Dashboard shows decks and statistics

### Email System Tests
- [ ] Registration emails are sent and received
- [ ] Email confirmation links work
- [ ] Password reset emails are sent
- [ ] Password reset links work and expire correctly
- [ ] Emails are sent from noreply@blueturtle.ai

### Security Tests
- [ ] HTTPS is working correctly
- [ ] JWT tokens are being generated and validated
- [ ] Rate limiting is active on auth endpoints
- [ ] CORS is properly configured
- [ ] Input validation is working

## Troubleshooting Commands

```bash
# Install Railway CLI for debugging
npm install -g @railway/cli
railway login

# View service logs
railway logs --service backend
railway logs --service frontend

# Check service status
railway status

# View environment variables
railway variables
```

## Common Issues and Solutions

### Backend Won't Start
1. Check logs: `railway logs --service backend`
2. Verify all environment variables are set
3. Ensure DATABASE_URL is automatically provided
4. Check if Gemini API key is valid

### Frontend Won't Load
1. Check logs: `railway logs --service frontend`
2. Verify NEXT_PUBLIC_API_URL points to backend service
3. Ensure NODE_ENV is set to production
4. Check if custom domain is properly configured

### Database Connection Issues
1. Verify PostgreSQL service is running
2. Check if DATABASE_URL is available to backend
3. Review database logs in Railway dashboard

### Email Not Working
1. Verify RESEND_API_KEY is correct
2. Check if noreply@blueturtle.ai is configured in Resend
3. Ensure FRONTEND_URL is set correctly for email links

### Custom Domain Not Working
1. Verify DNS CNAME record is set correctly
2. Wait for DNS propagation (up to 48 hours)
3. Check Railway domain configuration
4. Ensure CORS_ALLOWED_ORIGINS includes your domain

## Success Criteria

✅ **Deployment is successful when:**
- Both services are active and healthy
- Custom domain synth.blueturtle.ai loads the application
- All core features work correctly
- Email system is functional
- Database is connected and storing data
- Security measures are active

## Next Steps After Successful Deployment

1. **Monitor Performance**:
   - Check Railway metrics for CPU/memory usage
   - Monitor response times and error rates
   - Set up alerts for service health

2. **Security Hardening**:
   - Review all environment variables
   - Ensure secrets are properly secured
   - Monitor for any security issues

3. **User Testing**:
   - Test with real users
   - Collect feedback on performance
   - Monitor for any issues or bugs

4. **Documentation**:
   - Update README with production URLs
   - Document any deployment-specific configurations
   - Create user guides if needed

## Emergency Procedures

### If Deployment Fails
1. Check Railway logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure database service is healthy
4. Check if any services are hitting resource limits

### If Services Go Down
1. Check Railway dashboard for service status
2. Review logs for error messages
3. Restart services if needed: Railway dashboard → Service → Settings → Restart
4. Check if it's a Railway platform issue

---

**Deployment Target**: https://synth.blueturtle.ai
**Expected Deployment Time**: 15-30 minutes
**DNS Propagation Time**: 5-15 minutes