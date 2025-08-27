# Мессенджер на Handlebars и Vite

## Описание

Веб-мессенджер, реализованный на Handlebars, Vite и Express.  
Поддержка роутинга через History API.  
Используются современные CSS-фичи через postcss, postcss-nested, autoprefixer, postcss-preset-env.  
Требуется Node.js >= 18.

Макет в Figma:  
https://www.figma.com/design/oXZLhwgYixawcvG0LrUDih/y.messenger?node-id=3-2&t=WPmItYt5t8Xwdq8l-1

Демо:  
https://ovs-messenger.netlify.app/

---

## Навигация по страницам

- [Авторизация /login](https://ovs-messenger.netlify.app/login)  
- [Регистрация /register](https://ovs-messenger.netlify.app/register)  
- [Чаты /chat](https://ovs-messenger.netlify.app/chat)  
- [Настройки профиля /settings](https://ovs-messenger.netlify.app/settings)  
- [Ошибка 404 /404](https://ovs-messenger.netlify.app/404)  
- [Ошибка 500 /500](https://ovs-messenger.netlify.app/500)  

---

## Запуск проекта

- Установка зависимостей:  
  `npm install`

- Запуск в режиме разработки:  
  `npm run dev`

- Сборка проекта:  
  `npm run build`

- Запуск production-сервера:  
  `npm run start`

- Просмотр собранного приложения:  
  `npm run preview`

---

## Структура

- src/components — переиспользуемые UI-компоненты
- src/pages — шаблоны страниц
- src/assets — статические ресурсы (иконки, изображения)
- src/helpers — вспомогательные функции

---

## Особенности

- Полностью SPA-роутинг через History API.  
- Серверная отдача статики через Express.
- Прямая работа со страницами по ссылке (полная поддержка переходов браузером, F5 и прямых url).
- Организация кода без больших фреймворков — только Handlebars, DOM API и ES-модули.
