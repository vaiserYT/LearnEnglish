# 🎨 Design System - FluentAI

## Цветовая палитра

### Основные цвета
```css
/* Dark theme background */
--dark-bg: #0a0a0a
--dark-surface: #141414
--dark-card: #1a1a1a
--dark-border: #2a2a2a
--dark-hover: #242424

/* Primary - Синий */
--primary-400: #38bdf8
--primary-500: #0ea5e9
--primary-600: #0284c7

/* Accent Purple - Фиолетовый */
--accent-purple: #a855f7

/* Accent Pink - Розовый */
--accent-pink: #ec4899

/* Accent Green - Зелёный */
--accent-green: #10b981

/* Accent Yellow - Жёлтый */
--accent-yellow: #f59e0b

/* Accent Blue - Голубой */
--accent-blue: #3b82f6
```

## Компоненты

### Кнопки

**Primary Button**
- Градиент: `from-primary-600 to-primary-500`
- Тень: `shadow-lg hover:shadow-glow`
- Трансформация: `hover:scale-[1.02] active:scale-[0.98]`
- Анимация: Shimmer effect на hover

**Secondary Button**
- Фон: `bg-dark-card`
- Бордер: `border-dark-border hover:border-primary-500/50`
- Тень: `shadow-sm hover:shadow-md`

### Карточки

**Base Card**
- Градиент: `from-dark-card to-dark-surface`
- Бордер: `border-dark-border`
- Радиус: `rounded-2xl`
- Тень: `shadow-xl`
- Backdrop blur на hover

**Interactive Card**
- Все свойства Base Card
- Transform: `hover:scale-[1.02]`
- Glow: `hover:shadow-glow-lg`
- Бордер: `hover:border-primary-500/30`

**Stat Card**
- Иконка в градиентном контейнере
- Анимация иконки: `group-hover:scale-110 group-hover:rotate-3`
- Gradient text для значений

### Инпуты

- Фон: `bg-dark-surface/50` с backdrop blur
- Focus: `ring-2 ring-primary-500/50`
- Внутренняя тень: `shadow-inner-glow`

### Сообщения

**User Message**
- Градиент: `from-primary-600 to-primary-500`
- Радиус: `rounded-2xl rounded-br-sm` (вырез справа снизу)
- Тень: `shadow-lg`
- Анимация: `animate-slide-up`

**AI Message**
- Градиент: `from-dark-card to-dark-surface`
- Радиус: `rounded-2xl rounded-bl-sm` (вырез слева снизу)
- Бордер: `border-dark-border`
- Тень: `shadow-lg`

**Corrections Display**
- Фон: `from-accent-yellow/10 to-orange-500/5`
- Бордер: `border-accent-yellow/30`
- Иконка в желтом контейнере
- Подсветка ошибок: красный фон
- Подсветка исправлений: зелёный фон

## Анимации

### Ключевые кадры

```css
@keyframes float {
  0%, 100% { transform: translateY(0px) }
  50% { transform: translateY(-20px) }
}

@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0 }
  100% { transform: translateY(0); opacity: 1 }
}

@keyframes fadeIn {
  0% { opacity: 0 }
  100% { opacity: 1 }
}

@keyframes shimmer {
  0% { backgroundPosition: -1000px 0 }
  100% { backgroundPosition: 1000px 0 }
}
```

### Классы анимаций

- `animate-float` - Плавающие элементы фона (6s)
- `animate-slide-up` - Появление снизу вверх (0.5s)
- `animate-fade-in` - Плавное появление (0.5s)
- `animate-shimmer` - Мерцающий эффект (2s)
- `animate-pulse-slow` - Медленная пульсация (3s)

## Эффекты

### Glassmorphism
- `backdrop-blur-xl` - Размытие фона
- `bg-dark-surface/80` - Полупрозрачный фон
- Использование: Header, карточки, input area

### Gradient Overlays
- Радиальные градиенты на фоне страниц
- Цвета: primary, purple, pink с низкой прозрачностью (5-10%)
- Анимация: `animate-float`

### Glow Effects
- `shadow-glow` - 20px rgba(14, 165, 233, 0.3)
- `shadow-glow-lg` - 40px rgba(14, 165, 233, 0.4)
- `shadow-inner-glow` - Внутреннее свечение

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(to right, primary-400, accent-purple, accent-pink);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Типографика

### Заголовки
- H1: `text-5xl font-bold gradient-text`
- H2: `text-2xl font-bold`
- H3: `text-xl font-bold`

### Текст
- Body: `text-white`
- Secondary: `text-gray-400`
- Tertiary: `text-gray-500`

### Размеры
- XS: `text-xs` (12px)
- SM: `text-sm` (14px)
- Base: `text-base` (16px)
- LG: `text-lg` (18px)
- XL: `text-xl` (20px)

## Пространство

### Padding
- Карточки: `p-6`
- Кнопки: `px-6 py-3`
- Инпуты: `px-4 py-3`

### Gap
- Маленький: `gap-2` (8px)
- Средний: `gap-4` (16px)
- Большой: `gap-8` (32px)

### Border Radius
- Маленький: `rounded-lg` (8px)
- Средний: `rounded-xl` (12px)
- Большой: `rounded-2xl` (16px)
- Круг: `rounded-full`

## Иконки

### Размеры
- Маленькие: `w-4 h-4`
- Средние: `w-6 h-6`
- Большие: `w-10 h-10`

### Контейнеры иконок
```jsx
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-purple/10 flex items-center justify-center">
  <Icon className="w-5 h-5 text-primary-400" />
</div>
```

## Состояния

### Hover
- Scale: `hover:scale-105` или `hover:scale-[1.02]`
- Brightness: через цвет (darker shade)
- Shadow: `hover:shadow-glow`

### Active
- Scale: `active:scale-95` или `active:scale-[0.98]`

### Focus
- Ring: `focus:ring-2 focus:ring-primary-500/50`
- Border: `focus:border-primary-500/50`

### Disabled
- Opacity: `disabled:opacity-50`
- Cursor: `disabled:cursor-not-allowed`

## Transitions

### Длительность
- Быстрая: `duration-200`
- Средняя: `duration-300` (по умолчанию)
- Медленная: `duration-500`

### Easing
- По умолчанию: `ease-out`
- Анимации: `ease-in-out`

## Responsive

### Breakpoints
- SM: `640px`
- MD: `768px`
- LG: `1024px`
- XL: `1280px`

### Паттерны
```jsx
// Мобильные: вертикальный стек
// Планшеты: 2 колонки
// Десктоп: 3-4 колонки
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
```

## Best Practices

1. **Всегда используйте анимации для появления элементов**
   - Добавляйте `animate-slide-up` с `animationDelay`

2. **Группируйте hover эффекты**
   - Используйте `group` и `group-hover:`

3. **Градиенты для акцентов**
   - Кнопки, заголовки, важные значения

4. **Backdrop blur для overlay элементов**
   - Headers, modals, floating panels

5. **Консистентные отступы**
   - Используйте одинаковые gap/padding values

6. **Semantic colors**
   - Green для успеха/прогресса
   - Yellow для предупреждений
   - Red для ошибок
   - Blue для информации

---

**Дизайн-система FluentAI v1.0**
Современный, минималистичный, премиум.
