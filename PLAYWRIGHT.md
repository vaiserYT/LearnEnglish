# Playwright Setup

Этот файл для настройки Playwright через MCP (Model Context Protocol).

## Установка Playwright

После запуска контейнеров можно установить Playwright для тестирования:

```bash
# В backend контейнере
docker-compose exec backend pip install playwright pytest-playwright

# Установка браузеров
docker-compose exec backend playwright install chromium
```

## Конфигурация для MCP

Если вы используете MCP сервер для Playwright, добавьте конфигурацию:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/playwright-mcp-server"
      ]
    }
  }
}
```

## Пример теста

```python
# backend/tests/test_ui.py
from playwright.sync_api import Page, expect

def test_homepage(page: Page):
    page.goto("http://frontend:5173")
    expect(page).to_have_title("English Learning AI")
    
def test_login(page: Page):
    page.goto("http://frontend:5173")
    page.click("text=Login")
    page.fill("input[type=text]", "testuser")
    page.fill("input[type=password]", "test123")
    page.click("button[type=submit]")
    expect(page).to_have_url("http://frontend:5173/dashboard")
```

## Запуск тестов

```bash
docker-compose exec backend pytest tests/test_ui.py
```

---

Playwright готов к использованию через MCP или напрямую для E2E тестирования.
