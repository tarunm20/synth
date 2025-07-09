# Synth Flashcard Generator - Claude Context

## Project Overview
Synth is an AI-powered flashcard generation and study application built with Spring Boot and Next.js. The application allows users to create flashcard decks from uploaded content, study with AI-powered grading, and track their learning progress.

## Architecture
- **Backend**: Spring Boot 3.2.0 with PostgreSQL database
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **AI Integration**: Google Gemini API for flashcard generation and answer grading
- **Authentication**: JWT-based authentication with Spring Security
- **Email Service**: Resend integration for transactional emails
- **Deployment**: Docker Compose for development, Railway for production

## Current Implementation Status

### ✅ Completed Features
- **User Authentication**: Registration, login, JWT token management
- **Email System**: Complete Resend integration for password reset and email confirmation
- **Password Reset**: Secure token-based password reset with HTML email templates
- **Email Confirmation**: User email verification with secure token system
- **Input Validation**: Strong password requirements and comprehensive form validation
- **Rate Limiting**: Protection against abuse on authentication and email endpoints
- **Flashcard Creation**: Generate flashcards from file uploads or text input using Gemini AI
- **Study Interface**: Answer-first study flow with AI grading and detailed feedback
- **Progress Tracking**: Resume study sessions, track completion, and save progress to database
- **Dashboard**: View all decks with mastery scores and continue studying options
- **Spaced Repetition**: Basic difficulty adjustment based on performance
- **Study Analytics**: Track study sessions with scores and completion rates
- **Security Hardening**: CORS configuration, JWT secret management, input sanitization

### 🔧 Current MVP Gaps (Production Readiness)

#### Essential User Features Missing:
- User profile management page
- Error boundaries and proper error handling
- 404/error pages
- Domain verification for email sending (currently requires onboarding@resend.dev)

#### Production Infrastructure Needs:
- Railway deployment configuration
- Custom domain setup for email sending
- Environment variable management for production
- Production database configuration
- Basic monitoring and health checks
- SSL/TLS certificate setup

## Technology Stack Details

### Backend (Spring Boot)
```
src/main/java/com/synth/flashcard/
├── config/          # Security, CORS, JWT configuration
├── controller/      # REST API endpoints
├── entity/          # JPA entities (User, Deck, Card, StudySession, StudyProgress)
├── repository/      # Data access layer
├── service/         # Business logic (StudyService, GeminiService, etc.)
└── dto/             # Data transfer objects
```

**Key Dependencies:**
- Spring Boot Starter Web
- Spring Boot Starter Security
- Spring Boot Starter Data JPA
- PostgreSQL Driver
- JWT Library

### Frontend (Next.js)
```
frontend/src/
├── app/             # App router pages
├── components/      # Reusable components
├── lib/             # Utilities (API client, auth context)
└── styles/          # Tailwind CSS styling
```

**Key Dependencies:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios for API calls

### Database Schema
```sql
-- Core entities
users (id, email, password, email_verified, subscription_tier, created_at)
decks (id, name, description, user_id, created_at)
cards (id, question, answer, difficulty, deck_id)
study_sessions (id, user_id, card_id, response, score, confidence, feedback, studied_at)
study_progress (id, user_id, deck_id, current_card_index, total_cards, cards_completed, is_completed, last_studied_at)

-- Email system
email_confirmation_tokens (id, token, user_id, created_at, expires_at, used)
password_reset_tokens (id, token, user_id, created_at, expires_at, used)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (sends email confirmation)
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/confirm-email` - Confirm email with token
- `POST /api/auth/resend-confirmation` - Resend email confirmation

### Deck Management
- `GET /api/decks/stats` - Get user's decks with statistics
- `POST /api/decks/upload` - Create deck from file upload
- `POST /api/decks/text` - Create deck from text input

### Study System
- `GET /api/study/deck/{deckId}` - Get cards for studying
- `POST /api/study/answer` - Submit answer for AI grading
- `GET /api/study/progress/{deckId}` - Get study progress
- `POST /api/study/progress/{deckId}` - Save study progress
- `DELETE /api/study/progress/{deckId}` - Clear study progress

## AI Integration (Gemini API)

### Flashcard Generation
The application uses Gemini AI to generate flashcards from user-provided content:
- Analyzes text/documents to extract key concepts
- Creates question-answer pairs optimized for learning
- Supports multiple question types and difficulty levels

### Answer Grading
AI-powered answer evaluation provides:
- Semantic similarity scoring (0.0 to 1.0)
- Confidence rating for the score
- Detailed feedback explaining the grade
- Considers partial credit for close answers

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Java 17+
- Node.js 18+

### Running Locally
```bash
# Clone repository
git clone <repository-url>
cd synth

# Start all services
docker-compose up --build

# Access application
Frontend: http://localhost:3000
Backend: http://localhost:8080
Database: localhost:5433
```

### Environment Configuration
```bash
# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_strong_jwt_secret
DB_PASSWORD=secure_database_password
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Current File Structure
```
synth/
├── backend/
│   ├── src/main/java/com/synth/flashcard/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── CLAUDE.md
├── FEATURES.md
└── README.md
```

## MVP Launch Priorities

### ✅ Phase 1 (Completed)
1. ✅ Fix security configurations (CORS, JWT, credentials)
2. ✅ Add password reset functionality
3. ✅ Add rate limiting and input validation
4. ✅ Email verification system
5. ✅ Strong password requirements

### 🔧 Phase 2 (Current Priority)
1. Deploy to Railway for production testing
2. Configure custom domain for email sending
3. Add error pages and boundaries
4. Implement user profile management

### 📋 Phase 3 (Launch Ready)
1. Basic monitoring setup
2. Database backup strategy
3. Performance optimization
4. Final testing and bug fixes

## Known Issues
- Domain verification required for email sending (currently uses onboarding@resend.dev)
- Missing user profile management
- No data export capabilities
- Limited error handling and user feedback
- Frontend uses development server in Docker

## Testing
Currently lacks comprehensive testing. Needs:
- Unit tests for backend services
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing for critical flows

## Deployment Notes
- **Railway Deployment**: Ready for production deployment on Railway
- **Email Service**: Configured with Resend API for transactional emails
- **Environment Variables**: All sensitive data managed via environment variables
- **Database**: PostgreSQL ready for production with proper migrations
- **SSL/TLS**: Handled automatically by Railway
- **Docker**: Multi-stage builds for optimized production containers

## Performance Considerations
- Database queries optimized with proper indexing
- JPA lazy loading configured
- Frontend uses React best practices
- Gemini API calls are optimized for batch processing
- Progress tracking minimizes database writes

## Future Enhancements (Post-MVP)
- Deck sharing and collaboration
- Advanced spaced repetition algorithms
- Mobile app or PWA
- Integration with external services (Anki, Quizlet)
- Advanced analytics and insights
- Bulk import/export features