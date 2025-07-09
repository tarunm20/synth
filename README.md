# 🧠 Synth - AI-Powered Flashcard Generator

A production-ready web application that automatically generates flashcards from uploaded documents using Gemini AI, featuring intelligent study modes, progress tracking, and spaced repetition for effective learning.

## ✨ Key Features

🤖 **AI-Powered Generation** - Upload text files and get intelligent flashcards  
📚 **Smart Study Mode** - Answer-first flow with AI grading and feedback  
📊 **Progress Tracking** - Resume sessions and track mastery scores  
🔒 **Secure Authentication** - JWT-based user management with password reset  
📧 **Email System** - Complete email functionality with Resend integration  
🛡️ **Security Hardened** - Input validation, rate limiting, and secure tokens  
⚡ **Production Ready** - Railway deployment with health monitoring  
🔐 **Password Reset** - Secure token-based password reset via email

## Features

### Core Functionality
- **File Upload**: Support for PDF and text files
- **AI Generation**: Automatic flashcard creation using Gemini API
- **Smart Study**: Spaced repetition algorithm for optimal learning
- **AI Grading**: Semantic similarity-based answer evaluation
- **User Management**: Secure authentication with JWT
- **Email System**: Password reset and email confirmation
- **Progress Tracking**: Analytics and study session history
- **Security**: Input validation, rate limiting, and secure tokens

### Technical Highlights
- **Backend**: Spring Boot 3.x with PostgreSQL
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Security**: JWT authentication with Spring Security
- **Email Service**: Resend integration for transactional emails
- **AI Integration**: Google Gemini API for content generation and grading
- **Containerization**: Docker and Docker Compose ready
- **Database**: PostgreSQL with JPA/Hibernate
- **Deployment**: Railway-ready with production configuration

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- Spring WebFlux (for email service)
- PostgreSQL
- Apache PDFBox
- JWT (jjwt)
- Resend API integration
- Maven

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod validation
- Axios
- Lucide React icons

### Infrastructure
- Docker & Docker Compose
- PostgreSQL database
- Environment-based configuration

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose (optional)
- PostgreSQL (if running locally)
- Claude API key from Anthropic

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone and Setup
```bash
git clone https://github.com/tarunm20/synth.git
cd synth

# Copy environment template
cp .env.template .env

# Edit .env with your Claude API key and other settings
```

### 2. Start Application
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - Set GEMINI_API_KEY to your Gemini API key
# - Configure database connection
# - Set JWT_SECRET to a secure random string

# Install dependencies and run
./mvnw spring-boot:run
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

#### 4. Database Setup
```bash
# Using Docker
docker run --name postgres-flashcards \
  -e POSTGRES_DB=flashcards \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Or install PostgreSQL locally and create database
createdb flashcards
```

### Docker Deployment

#### 1. Using Docker Compose (Recommended)
```bash
# Copy environment file
cp .env.example .env

# Set your environment variables in .env
export GEMINI_API_KEY=your-api-key-here

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

#### 2. Individual Services
```bash
# Backend only
docker build -t flashcard-backend .
docker run -p 8080:8080 flashcard-backend

# Frontend only
cd frontend
docker build -t flashcard-frontend .
docker run -p 3000:3000 flashcard-frontend
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/flashcards
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-gemini-api-key-here
RESEND_API_KEY=your-resend-api-key-here
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
PORT=8080
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration (sends email confirmation)
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/confirm-email` - Confirm email with token
- `POST /api/auth/resend-confirmation` - Resend email confirmation

### Deck Management
- `GET /api/decks` - List user's decks
- `GET /api/decks/{id}` - Get specific deck
- `POST /api/decks/upload` - Create deck from file upload
- `POST /api/decks/text` - Create deck from text content
- `DELETE /api/decks/{id}` - Delete deck

### Study System
- `GET /api/study/deck/{deckId}` - Get cards for study session
- `POST /api/study/answer` - Submit answer for grading
- `GET /api/study/sessions` - Get study history
- `GET /api/study/analytics` - Get study analytics

## Database Schema

### Users
- `id` (Primary Key)
- `email` (Unique)
- `password` (Encrypted)
- `email_verified` (Boolean)
- `subscription_tier` (Enum)
- `created_at`

### Decks
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `name`
- `description`
- `created_at`

### Cards
- `id` (Primary Key)
- `deck_id` (Foreign Key)
- `question`
- `answer`
- `difficulty` (EASY, MEDIUM, HARD)

### Study Sessions
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `card_id` (Foreign Key)
- `response`
- `score`
- `confidence`
- `studied_at`

### Email Confirmation Tokens
- `id` (Primary Key)
- `token` (Unique)
- `user_id` (Foreign Key)
- `created_at`
- `expires_at`
- `used` (Boolean)

### Password Reset Tokens
- `id` (Primary Key)
- `token` (Unique)
- `user_id` (Foreign Key)
- `created_at`
- `expires_at`
- `used` (Boolean)

## Development

### Running Tests
```bash
# Backend tests
./mvnw test

# Frontend tests
cd frontend
npm test
```

### Code Formatting
```bash
# Backend (using IDE formatter)
# Frontend
cd frontend
npm run lint
```

### Building for Production
```bash
# Backend
./mvnw clean package

# Frontend
cd frontend
npm run build
```

## Deployment

### Cloud Deployment (Railway/Heroku)

#### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name

# Set environment variables
heroku config:set GEMINI_API_KEY=your-key
heroku config:set JWT_SECRET=your-secret

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

### Environment Configuration for Production
- Set strong JWT secrets
- Configure secure database connections
- Set appropriate CORS origins
- Enable HTTPS
- Configure file upload limits
- Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Security Considerations

- JWT tokens expire after 24 hours
- Passwords are encrypted using BCrypt with strong password requirements
- File uploads are limited to 10MB
- Input validation on all endpoints with custom validation annotations
- CORS configured for security
- SQL injection prevention with JPA
- Rate limiting on authentication and email endpoints
- Secure token generation for password reset and email confirmation
- Email tokens expire after 1-24 hours depending on use case
- Comprehensive error handling without information disclosure

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Collaborative decks
- [ ] Advanced analytics
- [ ] Multiple file format support
- [ ] Offline mode
- [ ] Social features