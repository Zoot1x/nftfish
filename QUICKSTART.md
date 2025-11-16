# Quick Start Guide - Gift Spin Wheel

## ⚡ 5 минут до запуска

### Шаг 1: Получить Telegram API (3 минуты)

1. Откройте https://my.telegram.org/
2. Авторизуйтесь с номера Telegram
3. Нажмите "API development tools"
4. Создайте новое приложение
5. Скопируйте `API_ID` и `API_HASH`

### Шаг 2: Настроить Backend (1 минута)

```bash
cd backend
cp .env.example .env
```

Отредактируйте `backend/.env`:
```
TELEGRAM_API_ID=ваш_id_из_шага_1
TELEGRAM_API_HASH=ваш_hash_из_шага_1
PORT=3001
```

### Шаг 3: Установить зависимости (1 минута)

```bash
cd backend
npm install
pip install -r requirements.txt

cd ..
npm install  # (если ещё не установлены)
```

### Шаг 4: Запустить приложение

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Выведет: Server running on port 3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Выведет: http://localhost:5173
```

## 🎯 Готово!

Откройте браузер на `http://localhost:5173` и нажмите "Войти".

### Что происходит при авторизации

1. Вводите номер телефона → Telegram отправит вам код
2. Вводите 5-значный код из Telegram
3. (Опционально) Если включена 2FA → вводите пароль
4. Готово! Вы авторизованы ✅

## 📱 На мобильном телефоне

Приложение полностью адаптировано для мобильных устройств:
- Бургер-меню на мобильной версии
- Полный экран рулетки
- Touch-friendly кнопки

Просто откройте `http://your-ip:5173` на телефоне.

## 🐛 Проблемы?

### "Cannot find module"
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### "TELEGRAM_API_ID is required"
```bash
# Проверьте backend/.env заполнен и сохранён
cat backend/.env
```

### "Connection refused localhost:3001"
```bash
# Убедитесь что backend запущен в другом терминале
# Terminal 1 должна показывать: "Server running on port 3001"
```

### "Port 3001 already in use"
```bash
# Убейте процесс на порту 3001 или используйте другой порт
# Либо измените PORT в backend/.env и backend/server.js
```

## 📖 Подробная документация

- **SETUP.md** - Полная инструкция по настройке
- **backend/README.md** - API документация
- **INTEGRATION_SUMMARY.md** - Техническое описание интеграции

## 🚀 Production Deployment

Для запуска на сервере используйте PM2:

```bash
npm install -g pm2

# Backend
cd backend && pm2 start server.js --name "gift-spin-backend"

# Frontend (после npm run build)
pm2 start "npx http-server dist" --name "gift-spin-frontend"

pm2 save
pm2 startup
```

---

**Всё готово! Начните крутить! 🎡**
