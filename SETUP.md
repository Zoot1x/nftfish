# Запуск приложения Gift Spin Wheel

## Шаг 1: Получение Telegram API credentials

1. Перейдите на https://my.telegram.org/
2. Авторизуйтесь с вашего номера телефона Telegram
3. Нажмите на "API development tools"
4. Создайте новое приложение, заполнив:
   - App title (название)
   - Short name (короткое название)
   - Platform: Other
5. Вы получите `API_ID` и `API_HASH` - **сохраните их**

## Шаг 2: Настройка Backend

```bash
# Перейдите в папку backend
cd backend

# Создайте файл .env
cp .env.example .env

# Отредактируйте .env и добавьте ваши credentials
nano .env
# Измените:
# TELEGRAM_API_ID=your_id_here
# TELEGRAM_API_HASH=your_hash_here

# Установите зависимости Node.js
npm install

# Установите зависимости Python
pip install -r requirements.txt
```

## Шаг 3: Запуск Backend

```bash
# Из папки backend
npm start
```

Сервер запустится на `http://localhost:3001`

## Шаг 4: Запуск Frontend (в новом терминале)

```bash
# Из корня проекта
npm run dev
```

Приложение откроется на `http://localhost:5173`

## Проверка работы

1. Откройте приложение в браузере
2. Нажмите на кнопку "Войти"
3. Введите ваш номер Telegram в формате +79991234567
4. На вашем телефоне придёт сообщение от @BotFather с кодом
5. Введите 5-значный код в модальном окне
6. Если включена 2FA - введите пароль
7. После успешной авторизации вы будете перенаправлены в приложение

## Возможные проблемы

**Ошибка: "Ошибка подключения к серверу"**
- Убедитесь, что backend запущен на `http://localhost:3001`
- Проверьте, что `VITE_API_URL` в `.env` (фронтенд) = `http://localhost:3001`

**Ошибка: "Telethon connection error"**
- Убедитесь, что вы установили правильные `TELEGRAM_API_ID` и `TELEGRAM_API_HASH` в `backend/.env`
- Проверьте интернет-соединение

**Сессия не сохраняется**
- Сессия Telegram хранится в `backend/sessions/{phone}.session`
- При следующем входе с тем же номером воспользуется сохранённой сессией

## Production Deployment

Для развёртывания в production:

1. **Frontend**:
   ```bash
   npm run build
   # Загрузьте папку dist на хостинг (Vercel, Netlify, AWS S3, etc.)
   ```

2. **Backend**:
   - Установите переменные окружения на сервере
   - Используйте process manager (PM2, systemd, Docker)
   - Настройте CORS для вашего домена
   - Используйте HTTPS

## Структура проекта

```
.
├── src/              # React приложение
├── backend/          # Node.js + Python backend
│  ├── server.js      # Express сервер
│  ├── auth.py        # Telethon авторизация
│  └── .env           # Telegram credentials (не коммитить!)
├── .env              # Frontend config
└── README.md         # Документация
```
