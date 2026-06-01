# Лендинг: «Как начать зарабатывать с помощью голоса»

Премиальный одностраничный лендинг для бесплатного вебинара школы озвучки.  
Чистый HTML/CSS/JS — без фреймворков, без сборщика, без зависимостей.

## Структура файлов

```
reg/
├── index.html      # Вся разметка и контент
├── styles.css      # Дизайн-токены, layout, адаптив, анимации, модал
├── script.js       # Открытие/закрытие модала, focus trap, reveal
└── README.md
```

## Запуск локально

**Вариант 1 — Python (рекомендуется):**
```bash
python -m http.server 8000
# открыть http://localhost:8000
```

**Вариант 2 — Node.js:**
```bash
npx serve .
```

**Вариант 3 — напрямую:**  
Двойной клик по `index.html` — работает, все пути относительные.

## Публикация на GitHub Pages

1. Создать репозиторий на GitHub и запушить файлы в ветку `main`.
2. Перейти в **Settings → Pages**.
3. Источник: `Deploy from a branch`, ветка `main`, директория `/ (root)`.
4. Сохранить — страница появится по адресу `https://<username>.github.io/<repo>/`.

## Подключение виджета GetCourse

В `index.html` найти элемент:
```html
<div id="getcourse-widget-placeholder" ...>
```
Заменить его содержимое (или весь блок) на embed-код виджета GetCourse.

## Технические детали

- Шрифты: **Unbounded** (display, 700–900) + **Manrope** (body, 400–700) через Google Fonts CDN.
- Адаптив: 1440 / 1024 / 768 / 390 px — без горизонтального скролла.
- Анимации: CSS `animation-delay` + IntersectionObserver для reveal; `prefers-reduced-motion` поддерживается.
- Модальное окно: `role="dialog"`, `aria-modal`, focus trap, scroll lock, закрытие по ✕ / overlay / Escape.
- Contrast ratio ≥ 4.5:1, touch targets ≥ 44px, focus rings на всех интерактивных элементах.
