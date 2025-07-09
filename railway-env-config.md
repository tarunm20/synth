# Railway Environment Configuration for synth.blueturtle.ai

## Backend Service Environment Variables

Set these in your Railway backend service:

```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=re_T9VNkF49_PT6i9wiu54JMWb6XKuHeU7Yz

# Security
JWT_SECRET=your_super_secure_jwt_secret_32_plus_characters_here

# Database (Railway auto-provides these)
DATABASE_URL=${DATABASE_URL}
DATABASE_USERNAME=${PGUSER}
DATABASE_PASSWORD=${PGPASSWORD}

# Email Configuration
RESEND_FROM_EMAIL=noreply@blueturtle.ai
FRONTEND_URL=https://synth.blueturtle.ai

# Application Settings
SERVER_PORT=8080
LOG_LEVEL=INFO
CORS_ALLOWED_ORIGINS=https://synth.blueturtle.ai

# Spring Profile
SPRING_PROFILES_ACTIVE=production
```

## Frontend Service Environment Variables

Set these in your Railway frontend service:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-service-name.railway.app/api
NODE_ENV=production
```

## DNS Configuration for blueturtle.ai

You'll need to add a CNAME record:

```
Type: CNAME
Name: synth
Value: [your-railway-frontend-url].railway.app
TTL: 300 (or Auto)
```

## Steps to Configure:

1. **Get your Gemini API key** from [Google AI Studio](https://aistudio.google.com/)
2. **Generate JWT secret**: `openssl rand -base64 32`
3. **Set environment variables** in Railway dashboard
4. **Configure DNS** in your blueturtle.ai domain settings
5. **Add custom domain** in Railway frontend service settings