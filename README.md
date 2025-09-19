# y.messenger

Современный веб-мессенджер на TypeScript, Handlebars и Vite. Приложение реализует SPA-роутинг без крупных фреймворков, поддерживает прямые переходы по ссылкам и поставляется с сервером на Express для раздачи статических файлов.

## Содержание
- [Основные возможности](#основные-возможности)
- [Технологический стек](#технологический-стек)
- [Начало работы](#начало-работы)
  - [Требования](#требования)
  - [Установка](#установка)
  - [Скрипты npm](#скрипты-npm)
- [Структура проекта](#структура-проекта)
- [Кодстайл и проверка качества](#кодстайл-и-проверка-качества)
- [Полезные ссылки](#полезные-ссылки)

## Основные возможности
- Маршрутизация через History API с поддержкой прямых URL и обновления страницы.
- Модульная библиотека интерфейсных компонентов на Handlebars.
- Формы с валидацией на стороне клиента и настраиваемыми сообщениями об ошибках.
- Сборка и горячая перезагрузка через Vite, раздача бандла Express-сервером.
- Современный CSS-стек на PostCSS (postcss-nested, autoprefixer, postcss-preset-env).

## Технологический стек
- TypeScript 5+
- Handlebars
- Vite
- Express (production-сервер)
- PostCSS и кастомные препроцессоры
- Netlify для деплоя демо-версии

## Начало работы

### Требования
- Node.js версии 20.19.0 или новее
- npm 10+

### Установка
```bash
npm install
```

Запуск проекта во время разработки выполняется одной командой:
```bash
npm run dev
```

### Скрипты npm
| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запуск development-сервера Vite с HMR. |
| `npm run build` | Сборка production-версии в `dist/`. |
| `npm run preview` | Локальный предпросмотр собранного бандла. |
| `npm run start` | Сборка и запуск Express-сервера (`server.cjs`). |
| `npm run lint` | Проверка TypeScript/JavaScript-части ESLint. |
| `npm run lint:fix` | ESLint с автоматическим исправлением. |
| `npm run lint:css` | Проверка стилей Stylelint. |
| `npm run lint:fix:css` | Stylelint с автоисправлениями. |

## Структура проекта
```
├── src/
│   ├── App.ts             # Точка входа приложения и инициализация роутов
│   ├── assets/            # Статические данные и mock-и
│   ├── components/        # UI-компоненты (atoms, molecules, organisms, layouts)
│   ├── framework/         # Мини-фреймворк: Block, EventBus и др. инфраструктура
│   ├── helpers/           # Вспомогательные функции и Handlebars-хелперы
│   ├── pages/             # Шаблоны страниц и их контейнеры
│   ├── styles/            # Глобальные стили и переменные
│   └── utils/             # Утилиты (валидация форм, HTTPTransport, парсеры)
├── server.cjs             # Express-сервер для продакшн-сборки
├── tsconfig.json          # Настройки компилятора TypeScript
├── vite.config.js         # Конфигурация Vite
└── postcss.config.js      # Конвейер PostCSS
```

## Кодстайл и проверка качества
- Проект использует строгий `tsconfig` со включённым `strict` и `noImplicitAny`.
- ESLint настроен на базу Airbnb для TypeScript и Prettier-совместимость.
- Stylelint проверяет CSS/PCSS-файлы и поддерживает автоисправления.
- Перед созданием pull request рекомендуется запускать `npm run lint` и `npm run lint:css`.

## Полезные ссылки
- Макет в Figma: https://www.figma.com/design/oXZLhwgYixawcvG0LrUDih/y.messenger?node-id=3-2&t=WPmItYt5t8Xwdq8l-1
- Демо на Netlify: https://ovs-messenger.netlify.app/
- Основные страницы: `/login`, `/register`, `/chat`, `/settings`, `/404`, `/500`
