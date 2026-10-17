# English Learning AI

AI-powered conversational English learning platform. Learn English through natural conversation, not grammar rules.

## Features

- 🗣️ **Conversational Learning** - Practice English through real conversations with AI
- 🎯 **Personalized Learning Plans** - AI adapts to your level and creates custom learning paths
- 📊 **Progress Tracking** - Monitor your fluency, pronunciation, grammar, and comprehension
- 🎤 **Voice Support** - Voice input and text-to-speech for authentic practice
- ✅ **Real-time Corrections** - Get instant feedback on grammar, vocabulary, and expressions
- 📈 **Adaptive AI** - System learns from your mistakes and adjusts difficulty

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS (dark theme)
- Zustand (state management)
- React Router
- Axios

### Backend
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy + Alembic
- JWT authentication
- OpenAI / Claude API integration

### Infrastructure
- Docker + Docker Compose
- Multi-container setup (frontend, backend, database)

## Getting Started

### Prerequisites

- Docker & Docker Compose
- LLM API key (OpenAI or Claude)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app
```

2. Copy environment file and configure:
```bash
cp .env.example .env
```

3. Edit `.env` and add your API keys:
```bash
# Choose your LLM provider
LLM_PROVIDER=openai  # or claude

# Add your API key
OPENAI_API_KEY=your_key_here
# or
CLAUDE_API_KEY=your_key_here
```

4. Start the application:
```bash
docker-compose up --build
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Database Migrations

Migrations run automatically on startup. To run manually:

```bash
docker-compose exec backend alembic upgrade head
```

To create a new migration:
```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
```

## Development

### Backend Development

The backend uses FastAPI with hot-reload enabled:

```bash
# View logs
docker-compose logs -f backend

# Run tests (when implemented)
docker-compose exec backend pytest

# Access Python shell
docker-compose exec backend python
```

### Frontend Development

The frontend uses Vite with hot-reload:

```bash
# View logs
docker-compose logs -f frontend

# Install new package
docker-compose exec frontend npm install <package>
```

## Project Structure

```
app/
├── backend/
│   ├── app/
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # Database connection
│   │   ├── auth.py            # Authentication
│   │   ├── config.py          # Configuration
│   │   ├── main.py            # FastAPI app
│   │   ├── routers/           # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── conversations.py
│   │   │   └── progress.py
│   │   └── services/          # Business logic
│   │       ├── llm_service.py
│   │       ├── learning_service.py
│   │       └── conversation_service.py
│   ├── alembic/               # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   │   ├── AuthPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ConversationPage.tsx
│   │   │   └── ProgressPage.tsx
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/me` - Get current user
- `POST /users/assess` - Assess user's English level
- `GET /users/learning-plan` - Get learning plan
- `POST /users/learning-plan/refresh` - Regenerate learning plan

### Conversations
- `POST /conversations` - Start new conversation
- `GET /conversations` - Get user's conversations
- `GET /conversations/{id}` - Get specific conversation
- `POST /conversations/{id}/messages` - Send message
- `POST /conversations/{id}/end` - End conversation

### Progress
- `GET /progress` - Get user progress statistics

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `LLM_PROVIDER` - Choose `openai` or `claude`
- `OPENAI_API_KEY` / `CLAUDE_API_KEY` - Your API key
- `OPENAI_API_BASE` / `CLAUDE_API_BASE` - API endpoint (for custom gateways)
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ for English learners worldwide
