# Инструкция по деплою BuildSync CRM на Render и GitHub

Эта инструкция поможет вам перенести проект из Google AI Studio на ваш собственный GitHub и развернуть его на платформе Render с использованием реальной базы данных PostgreSQL.

## Шаг 1: Подготовка кода и экспорт на GitHub

1.  **Создайте репозиторий на GitHub:**
    *   Зайдите на [github.com](https://github.com) и создайте новый публичный или приватный репозиторий (например, `build-sync-crm`).
2.  **Свяжите проект с GitHub (из AI Studio):**
    *   В меню Google AI Studio (иконка шестеренки или меню проекта) выберите **"Export to GitHub"**.
    *   Следуйте инструкциям для авторизации и выбора вашего нового репозитория.
    *   *Альтернатива:* Вы можете скачать проект как ZIP-архив, распаковать у себя на компьютере и запушить через Git CLI:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git remote add origin https://github.com/ВАШ_ЛОГИН/build-sync-crm.git
        git push -u origin main
        ```

## Шаг 2: Создание базы данных на Render

1.  Зайдите в личный кабинет на [Render.com](https://render.com).
2.  Нажмите кнопку **New +** и выберите **PostgreSQL**.
3.  Заполните данные:
    *   **Name:** `crm-db`
    *   **Database:** `crm_database`
    *   **User:** (любое имя)
    *   **Region:** Выберите ближайший к вам (например, Frankfurt).
4.  Нажмите **Create Database**.
5.  После создания найдите раздел **Connections** и скопируйте **Internal Database URL** (если деплоите сервис тоже на Render) или **External Database URL** (для локальной проверки). Нам понадобится эта ссылка в следующем шаге.

## Шаг 3: Деплой веб-сервиса на Render

1.  Нажмите **New +** и выберите **Web Service**.
2.  Подключите свой GitHub-аккаунт и выберите ваш репозиторий `build-sync-crm`.
3.  Настройте параметры сервиса:
    *   **Name:** `build-sync-portal`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm run start`
4.  Нажмите кнопку **Advanced** -> **Add Environment Variable**:
    *   `DATABASE_URL`: вставьте ссылку, которую вы скопировали на Шаге 2.
    *   `GEMINI_API_KEY`: ваш ключ от Google Gemini (если используете функции ИИ).
    *   `NODE_ENV`: `production`
5.  Нажмите **Create Web Service**.

## Шаг 4: Переход с LocalStorage на PostgreSQL (Инфо)

Чтобы приложение начало сохранять данные в PostgreSQL вместо локальной памяти браузера:
1.  Установите библиотеку для работы с БД (например, Prisma или pg): `npm install prisma @prisma/client`.
2.  Настройте модели в файле `prisma/schema.prisma`.
3.  Замените логику в папке `src/services/` на API-запросы к вашему новому серверу (`/api/tasks`, `/api/materials` и т.д.).

**Теперь ваш портал доступен по адресу `https://build-sync-portal.onrender.com`!**
