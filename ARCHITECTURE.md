# Architecture Documentation

## Обзор архитектуры

Приложение построено по трехуровневой архитектуре с четким разделением ответственности.

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend                           │
│   React + TypeScript + Tailwind CSS + Zustand          │
│                   (Port 5173)                           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│                      Backend                             │
│        FastAPI + Python + SQLAlchemy + JWT             │
│                   (Port 8000)                           │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌────────┐
   │PostreSQL│  │OpenAI   │  │Claude │
   │  (5432)│  │   API   │  │  API   │
   └────────┘  └─────────┘  └────────┘
```

## Backend Architecture

### Слои приложения

```
app/
├── routers/              # API endpoints (HTTP layer)
│   ├── auth.py          # Authentication routes
│   ├── users.py         # User management
│   ├── conversations.py # Conversation endpoints
│   └── progress.py      # Progress tracking
│
├── services/            # Business logic layer
│   ├── llm_service.py   # LLM integration
│   ├── learning_service.py  # Learning plan logic
│   └── conversation_service.py # Conversation management
│
├── models.py            # Database models (ORM)
├── schemas.py           # Pydantic schemas (validation)
├── database.py          # Database connection
├── auth.py              # JWT authentication
├── config.py            # Configuration management
└── main.py              # FastAPI application
```

### Поток данных

1. **HTTP Request** → Router (validation via Pydantic)
2. **Router** → Service (business logic)
3. **Service** → Database/LLM API
4. **Response** ← Service ← Router

### Ключевые компоненты

#### 1. LLM Service
Единый интерфейс для работы с разными LLM провайдерами:
- OpenAI (GPT-4)
- Claude (Anthropic)

```python
# Автоматически выбирает провайдера из .env
response = await llm_service.generate_completion(messages)
```

#### 2. Learning Service
Управляет персонализированным обучением:
- Оценка уровня студента
- Создание учебного плана
- Адаптация под прогресс

#### 3. Conversation Service
Генерация ответов и анализ ошибок:
- Контекстные ответы AI
- Определение ошибок
- Сохранение в БД

## Frontend Architecture

### Структура

```
src/
├── pages/              # Route components
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── ConversationPage.tsx
│   └── ProgressPage.tsx
│
├── components/         # Reusable components
├── services/          # API clients
│   ├── api.ts         # Axios instance
│   ├── auth.service.ts
│   ├── conversation.service.ts
│   └── learning.service.ts
│
├── store/             # State management (Zustand)
│   └── auth.store.ts
│
└── types/             # TypeScript types
    └── index.ts
```

### State Management

**Zustand** используется для глобального состояния:
- Аутентификация пользователя
- Токен JWT
- Персистентность в localStorage

### Routing

React Router v6 с защищенными роутами:
- `/` - Auth page (login/register)
- `/dashboard` - Main dashboard (protected)
- `/conversation/:id` - Active conversation (protected)
- `/progress` - Progress tracking (protected)

## Database Schema

### Core Tables

```sql
users
├── id (PK)
├── email
├── username
├── hashed_password
├── level (enum: beginner -> advanced)
└── native_language

learning_plans
├── id (PK)
├── user_id (FK → users)
├── current_level
├── target_level
├── focus_areas (JSON)
├── weak_points (JSON)
├── strong_points (JSON)
└── next_topics (JSON)

conversations
├── id (PK)
├── user_id (FK → users)
├── title
├── topic
├── exercise_type
├── started_at
├── ended_at
└── duration_seconds

messages
├── id (PK)
├── conversation_id (FK → conversations)
├── role (user/assistant)
├── content
├── corrections (JSON)
└── feedback

user_progress
├── id (PK)
├── user_id (FK → users)
├── total_conversations
├── total_messages
├── fluency_score
├── pronunciation_score
├── grammar_score
└── comprehension_score

error_records
├── id (PK)
├── user_id (FK → users)
├── error_type
├── incorrect_text
├── correct_text
├── explanation
└── times_made
```

## LLM Integration

### Унифицированный интерфейс

```python
class LLMService:
    async def generate_completion(
        messages: List[Dict],
        temperature: float,
        max_tokens: int
    ) -> str
```

### OpenAI Flow
```
Request → OpenAI API → /chat/completions
       → Parse response → choices[0].message.content
```

### Claude Flow
```
Request → Claude API → /v1/messages
       → Convert message format
       → Parse response → content[0].text
```

### Context Management

Каждый запрос к LLM включает:
1. **System prompt** - роль AI, уровень студента, инструкции
2. **Conversation history** - последние 10 сообщений
3. **Current message** - текущий вопрос/ответ студента

## Authentication Flow

```
1. User registers → POST /auth/register
   → Hash password (bcrypt)
   → Save to DB
   
2. User logs in → POST /auth/login
   → Verify password
   → Generate JWT token (7 days expiry)
   → Return token + user data
   
3. Protected requests
   → Include: Authorization: Bearer <token>
   → Verify JWT
   → Extract user_id
   → Load user from DB
   → Execute request
```

## Adaptive Learning System

### Initial Assessment
```
User answers questions
  → LLM analyzes responses
  → Determines level (beginner → advanced)
  → Creates initial learning plan
```

### Continuous Adaptation
```
User has conversation
  → AI corrects errors in real-time
  → Errors saved to DB
  → After conversation ends:
     → Analyze performance
     → Update weak/strong points
     → Adjust focus areas
     → Select next topics
```

### Error Tracking
```
Error detected
  → Check if similar error exists in DB
  → If exists: increment times_made
  → If new: create error_record
  → Use for learning plan adaptation
```

## Deployment

### Docker Compose Services

1. **db** - PostgreSQL 15
   - Health check before backend starts
   - Persistent volume for data

2. **backend** - FastAPI
   - Auto-migrations on startup
   - Hot reload in development
   - Depends on db health

3. **frontend** - Vite dev server
   - Hot module replacement
   - Proxy to backend API
   - Depends on backend

### Environment Variables

Конфигурация через `.env`:
- Database credentials
- LLM API keys and endpoints
- JWT secret
- CORS origins

### Scaling Considerations

Для production:
- Add nginx reverse proxy
- Use gunicorn/uvicorn workers
- Redis for caching LLM responses
- Separate read replicas for PostgreSQL
- CDN for frontend static assets

## Security

1. **Authentication**: JWT with 7-day expiry
2. **Password**: bcrypt hashing
3. **CORS**: Restricted origins
4. **SQL**: SQLAlchemy ORM (防止 SQL injection)
5. **Input validation**: Pydantic schemas
6. **API keys**: Environment variables only

## Future Enhancements

- [ ] WebSocket для real-time чата
- [ ] Speech-to-text через Web Speech API
- [ ] Text-to-speech для произношения
- [ ] Redis кэширование частых запросов
- [ ] Celery для фоновых задач (email, отчеты)
- [ ] Analytics dashboard для преподавателей
- [ ] Mobile app (React Native)
- [ ] Gamification (badges, achievements)
