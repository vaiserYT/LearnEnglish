# Quick Start Guide

## 🚀 Быстрый старт

### 1. Настройка окружения

Откройте файл `.env` и добавьте ваш API ключ:

```bash
# Выберите провайдера LLM
LLM_PROVIDER=openai  # или claude

# Добавьте ваш API ключ
OPENAI_API_KEY=sk-your-actual-key-here
# или для Claude:
# CLAUDE_API_KEY=your-claude-key-here
```

### 2. Запуск приложения

```bash
docker-compose up --build
```

Подождите 2-3 минуты пока контейнеры запустятся и выполнятся миграции БД.

### 3. Доступ к приложению

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 4. Первый запуск

1. Откройте http://localhost:5173
2. Нажмите "Register"
3. Заполните форму регистрации:
   - Email: test@example.com
   - Username: testuser
   - Password: test123
   - Native Language: Russian
4. Войдите в систему
5. Нажмите "Start New Conversation"
6. Начните общаться с AI на английском!

## 🛠️ Команды разработки

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend
```

### Перезапуск сервисов
```bash
# Перезапустить все
docker-compose restart

# Перезапустить только backend
docker-compose restart backend
```

### Остановка
```bash
docker-compose down

# Остановка с удалением volumes (БД)
docker-compose down -v
```

### Работа с БД

```bash
# Применить миграции
docker-compose exec backend alembic upgrade head

# Создать новую миграцию
docker-compose exec backend alembic revision --autogenerate -m "description"

# Откатить миграцию
docker-compose exec backend alembic downgrade -1

# Подключиться к PostgreSQL
docker-compose exec db psql -U englishapp -d english_learning
```

### Установка новых пакетов

```bash
# Python (backend)
docker-compose exec backend pip install package-name
# Затем добавьте в backend/requirements.txt

# Node.js (frontend)
docker-compose exec frontend npm install package-name
```

## 🐛 Устранение проблем

### Backend не запускается
```bash
# Проверьте логи
docker-compose logs backend

# Пересоберите образ
docker-compose build --no-cache backend
docker-compose up backend
```

### Frontend не загружается
```bash
# Удалите node_modules и пересоберите
docker-compose down
docker-compose build --no-cache frontend
docker-compose up
```

### Ошибки БД
```bash
# Пересоздайте БД
docker-compose down -v
docker-compose up
```

### API ключ не работает
- Проверьте файл `.env`
- Убедитесь что ключ начинается с `sk-` (OpenAI) или правильный формат (Claude)
- Проверьте что `LLM_PROVIDER` соответствует вашему ключу

## 📱 Особенности приложения

### Разговорная практика
- AI адаптируется под ваш уровень
- Исправляет ошибки в реальном времени
- Дает подробные объяснения

### Персонализация
- Учебный план создается индивидуально
- Система отслеживает слабые и сильные стороны
- Темы подбираются под ваш прогресс

### Прогресс
- Статистика разговоров и времени практики
- Оценки по навыкам (беглость, произношение, грамматика)
- История всех разговоров

## 🎯 Следующие шаги

1. **Практикуйтесь ежедневно** - система отслеживает streak
2. **Изучайте исправления** - AI показывает ваши ошибки
3. **Следите за прогрессом** - раздел Progress показывает рост
4. **Пробуйте разные темы** - AI предлагает новые топики

## 💡 Советы

- Говорите естественно, не бойтесь ошибок
- Используйте голосовой ввод (кнопка микрофона) для практики произношения
- Слушайте ответы AI (кнопка "Listen") для улучшения восприятия на слух
- Обращайте внимание на corrections - это ключ к улучшению

Удачи в изучении английского! 🎓
