# Synth Flashcard Generator - Claude Context

## Project Overview
Synth is an AI-powered flashcard generation and study application built with Spring Boot and Next.js. The application allows users to create flashcard decks from uploaded content, study with AI-powered grading, and track their learning progress.

## Architecture
- **Backend**: Spring Boot 3.2.0 with PostgreSQL database
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **AI Integration**: Anthropic Claude API for flashcard generation and answer grading
- **Authentication**: JWT-based authentication with Spring Security
- **Deployment**: Docker Compose for development, production-ready containerization

## Current Implementation Status

### ✅ Completed Features
- **User Authentication**: Registration, login, JWT token management
- **Flashcard Creation**: Generate flashcards from file uploads or text input using Claude AI
- **Study Interface**: Answer-first study flow with AI grading and detailed feedback
- **Progress Tracking**: Resume study sessions, track completion, and save progress to database
- **Dashboard**: View all decks with mastery scores and continue studying options
- **Spaced Repetition**: Basic difficulty adjustment based on performance
- **Study Analytics**: Track study sessions with scores and completion rates

### 🔧 Current MVP Gaps (Production Readiness)

#### Critical Security Issues:
- CORS configuration allows all origins (`*`)
- JWT secret uses weak fallback key
- Database credentials hardcoded
- No input validation/sanitization
- No rate limiting on API endpoints

#### Essential User Features Missing:
- Password reset functionality
- Email verification
- User profile management
- Error boundaries and proper error handling
- 404/error pages

#### Production Infrastructure Needs:
- HTTPS/SSL configuration
- Environment variable management
- Production-optimized frontend build
- Health check endpoints
- Basic monitoring setup

## Technology Stack Details

### Backend (Spring Boot)
```
src/main/java/com/synth/flashcard/
├── config/          # Security, CORS, JWT configuration
├── controller/      # REST API endpoints
├── entity/          # JPA entities (User, Deck, Card, StudySession, StudyProgress)
├── repository/      # Data access layer
├── service/         # Business logic (StudyService, ClaudeService, etc.)
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
users (id, email, password, created_at)
decks (id, name, description, user_id, created_at)
cards (id, question, answer, difficulty, deck_id)
study_sessions (id, user_id, card_id, response, score, confidence, feedback, studied_at)
study_progress (id, user_id, deck_id, current_card_index, total_cards, cards_completed, is_completed, last_studied_at)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

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

## AI Integration (Claude API)

### Flashcard Generation
The application uses Claude AI to generate flashcards from user-provided content:
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
CLAUDE_API_KEY=your_claude_api_key
JWT_SECRET=your_strong_jwt_secret
DB_PASSWORD=secure_database_password

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

### Week 1 (Critical)
1. Fix security configurations (CORS, JWT, credentials)
2. Add password reset functionality
3. Implement production frontend build
4. Add basic error handling

### Week 2 (High Priority)
1. Add rate limiting and input validation
2. Implement health checks
3. Configure HTTPS
4. Add error pages and boundaries

### Week 3 (Medium Priority)
1. Email verification system
2. Basic monitoring setup
3. Data export functionality
4. Database backup strategy

## Known Issues
- Frontend uses development server in Docker
- No password strength requirements
- Missing user profile management
- No data export capabilities
- Limited error handling and user feedback

## Testing
Currently lacks comprehensive testing. Needs:
- Unit tests for backend services
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing for critical flows

## Deployment Notes
- Current Docker setup is development-focused
- Needs production environment configuration
- Requires SSL/TLS certificate setup
- Database needs production hardening
- No CI/CD pipeline currently implemented

## Performance Considerations
- Database queries optimized with proper indexing
- JPA lazy loading configured
- Frontend uses React best practices
- Claude API calls are optimized for batch processing
- Progress tracking minimizes database writes

## Future Enhancements (Post-MVP)
- Deck sharing and collaboration
- Advanced spaced repetition algorithms
- Mobile app or PWA
- Integration with external services (Anki, Quizlet)
- Advanced analytics and insights
- Bulk import/export features