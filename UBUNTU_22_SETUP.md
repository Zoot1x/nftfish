# 🚀 Полная инструкция установки на Ubuntu 22.04

Эта инструкция описывает установку Gift Spin Wheel приложения на свежий сервер Ubuntu 22.04 с нуля.

## 📋 Требования

- Ubuntu 22.04 LTS
- 2+ GB RAM
- 10+ GB свободного места
- sudo доступ
- Доступ в интернет

## 🔧 Шаг 1: Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

## 📦 Шаг 2: Установка Node.js (v18+)

```bash
# Добавляем NodeSource репозиторий
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Установка Node.js
sudo apt install -y nodejs

# Проверка версии
node --version  # Должно быть v18.x или выше
npm --version
```

## 🐍 Шаг 3: Установка Python (3.10+)

```bash
sudo apt install -y python3.10 python3.10-venv python3.10-dev python3-pip

# Проверка версии
python3 --version  # Должно быть 3.10+
pip3 --version
```

## 🗄️ Шаг 4: Установка PostgreSQL (опционально, для сохранения данных)

```bash
sudo apt install -y postgresql postgresql-contrib

# Запуск сервиса
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 📥 Шаг 5: Клонирование репозитория

```bash
# Переходим в домашнюю директорию
cd ~

# Клонируем репозиторий
git clone https://github.com/Zoot1x/nftfish.git gift-spin-wheel
cd gift-spin-wheel

# Переходим на основную ветку
git checkout main
```

## 🎨 Шаг 6: Установка зависимостей Frontend

```bash
# Установка npm зависимостей
npm install

# Сборка для продакшена
npm run build

# Проверка, что все скомпилировалось
ls -la dist/  # Должна существовать папка dist
```

## 🐍 Шаг 7: Установка зависимостей Admin Bot

```bash
cd admin-bot

# Создаем виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Проверка установки
python3 -c "import aiogram; print(f'aiogram {aiogram.__version__}')"

cd ..
```

## 🔌 Шаг 8: Установка зависимостей Backend

```bash
cd backend

# Установка npm зависимостей для backend (если есть)
npm install 2>/dev/null || true

# Создаем виртуальное окружение для Python части backend
python3 -m venv venv
source venv/bin/activate

# Устанавливаем зависимости
pip install -r requirements.txt

cd ..
```

## ⚙️ Шаг 9: Конфигурация окружения

### Frontend (.env в корне)
```bash
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001
VITE_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
VITE_CHANNEL_ID=YOUR_CHANNEL_ID_HERE
EOF
```

### Admin Bot (admin-bot/.env)
```bash
cat > admin-bot/.env << 'EOF'
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
ADMIN_ID=YOUR_TELEGRAM_ADMIN_ID
CHANNEL_ID=YOUR_TELEGRAM_CHANNEL_ID
BACKEND_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001
EOF
```

### Backend (backend/.env)
```bash
cat > backend/.env << 'EOF'
PORT=3001
NODE_ENV=production
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
ADMIN_ID=YOUR_TELEGRAM_ADMIN_ID
CHANNEL_ID=YOUR_TELEGRAM_CHANNEL_ID
EOF
```

## 🔑 Шаг 10: Получение токенов Telegram

1. Создайте бота через [@BotFather](https://t.me/botfather)
   - Отправьте `/newbot`
   - Следуйте инструкциям
   - Скопируйте токен формата `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`

2. Создайте Telegram канал для получения ID:
   ```bash
   # Отправьте сообщение в канал через бота и проверьте webhook
   ```

3. Получите свой Telegram ID:
   - Напишите боту [@userinfobot](https://t.me/userinfobot)

## 🚀 Шаг 11: Запуск приложения

### Способ 1: Прямой запуск (для тестирования)

```bash
# Terminal 1: Frontend (Vite dev server)
npm run dev

# Terminal 2: Backend
cd backend
npm start

# Terminal 3: Admin Bot
cd admin-bot
source venv/bin/activate
python3 bot.py
```

### Способ 2: Использование PM2 (для продакшена)

```bash
# Установка PM2 глобально
sudo npm install -g pm2

# Создаем конфиг для PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: '/home/username/gift-spin-wheel',
      script: 'npm',
      args: 'run build && npm run preview',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'backend',
      cwd: '/home/username/gift-spin-wheel/backend',
      script: 'npm',
      args: 'start',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'admin-bot',
      cwd: '/home/username/gift-spin-wheel/admin-bot',
      script: 'python3',
      args: 'bot.py',
      watch: false,
      interpreter: '/home/username/gift-spin-wheel/admin-bot/venv/bin/python3',
      env: {
        PATH: '/home/username/gift-spin-wheel/admin-bot/venv/bin'
      }
    }
  ]
};
EOF

# Запуск всех процессов
pm2 start ecosystem.config.js

# Сохранение конфига
pm2 save

# Автозапуск при перезагрузке
pm2 startup systemd -u $(whoami) --hp /home/$(whoami)
```

### Способ 3: Использование Systemd сервисов

#### Frontend сервис
```bash
sudo tee /etc/systemd/system/gift-frontend.service > /dev/null << 'EOF'
[Unit]
Description=Gift Spin Wheel Frontend
After=network.target

[Service]
Type=simple
User=username
WorkingDirectory=/home/username/gift-spin-wheel
ExecStart=/usr/bin/npm run build && /usr/bin/npm run preview
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

#### Backend сервис
```bash
sudo tee /etc/systemd/system/gift-backend.service > /dev/null << 'EOF'
[Unit]
Description=Gift Spin Wheel Backend
After=network.target

[Service]
Type=simple
User=username
WorkingDirectory=/home/username/gift-spin-wheel/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="PORT=3001"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF
```

#### Admin Bot сервис
```bash
sudo tee /etc/systemd/system/gift-bot.service > /dev/null << 'EOF'
[Unit]
Description=Gift Spin Wheel Admin Bot
After=network.target

[Service]
Type=simple
User=username
WorkingDirectory=/home/username/gift-spin-wheel/admin-bot
ExecStart=/home/username/gift-spin-wheel/admin-bot/venv/bin/python3 bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Перезагрузка конфигов systemd
sudo systemctl daemon-reload

# Запуск сервисов
sudo systemctl start gift-frontend
sudo systemctl start gift-backend
sudo systemctl start gift-bot

# Автозапуск при перезагрузке
sudo systemctl enable gift-frontend
sudo systemctl enable gift-backend
sudo systemctl enable gift-bot

# Проверка статуса
sudo systemctl status gift-frontend
sudo systemctl status gift-backend
sudo systemctl status gift-bot
```

## 🌐 Шаг 12: Настройка Nginx (опционально, для продакшена)

```bash
# Установка Nginx
sudo apt install -y nginx

# Создание конфига
sudo tee /etc/nginx/sites-available/gift-spin-wheel > /dev/null << 'EOF'
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:5173;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archives (TData downloads)
    location /archives {
        proxy_pass http://backend/archives;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
EOF

# Активация конфига
sudo ln -sf /etc/nginx/sites-available/gift-spin-wheel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка синтаксиса
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl restart nginx
```

## 🔒 Шаг 13: SSL сертификат (для продакшена)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 📊 Шаг 14: Мониторинг и логи

```bash
# Просмотр логов PM2
pm2 logs

# Просмотр логов Systemd
sudo journalctl -u gift-backend -f
sudo journalctl -u gift-bot -f

# Просмотр логов Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Проверка портов
netstat -tuln | grep -E '3001|5173|80|443'
lsof -i :3001
lsof -i :5173
```

## 🧪 Шаг 15: Тестирование

```bash
# Проверка API
curl http://localhost:3001/api/health

# Проверка Frontend
curl http://localhost:5173

# Проверка что бот подключен
# Отправьте /start боту в Telegram

# Проверка архивов TData
curl -I http://localhost:3001/archives/
```

## 🐛 Решение проблем

### Ошибка портов
```bash
# Если порты занты, найдите процесс
sudo lsof -i :3001
sudo lsof -i :5173

# И убейте его
sudo kill -9 <PID>
```

### Ошибка Python модулей
```bash
cd admin-bot
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### Ошибка Node модулей
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Ошибка подключения к БД
```bash
# Проверьте, запущена ли БД (если используется)
sudo systemctl status postgresql

# Проверьте переменные окружения
env | grep DATABASE
```

## 📝 Шаг 16: Резервная копия данных

```bash
# Создаем скрипт резервного копирования
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Архивируем все важные данные
tar -czf $BACKUP_DIR/gift-spin-wheel-$DATE.tar.gz \
  admin-bot/data \
  admin-bot/tdatas \
  backend/results \
  backend/sessions \
  backend/tdatas

# Удаляем старые архивы (старше 30 дней)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/gift-spin-wheel-$DATE.tar.gz"
EOF

chmod +x backup.sh

# Добавляем в crontab (ежедневно в 2:00 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/username/gift-spin-wheel/backup.sh") | crontab -
```

## 🎯 Проверка установки

```bash
# 1. Проверяем Node.js
node --version
npm --version

# 2. Проверяем Python
python3 --version

# 3. Проверяем установку модулей
npm list | head -20
pip list | grep -E 'aiogram|aiohttp|python-dotenv'

# 4. Проверяем файлы конфигурации
ls -la .env
ls -la admin-bot/.env
ls -la backend/.env

# 5. Проверяем папки данных
ls -la admin-bot/data/
ls -la backend/sessions/
ls -la backend/tdatas/
```

## 🔐 Безопасность

```bash
# Устанавливаем правильные разрешения
chmod 600 .env
chmod 600 admin-bot/.env
chmod 600 backend/.env

# Запрещаем прямой доступ к чувствительным папкам
sudo iptables -I INPUT -p tcp --dport 3001 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 5173 -j DROP  # Только через Nginx

# Сохраняем правила firewall
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `pm2 logs` или `journalctl -u service-name`
2. Убедитесь, что все порты открыты: `sudo ufw allow 80,443,3001/tcp`
3. Проверьте подключение интернета: `ping 8.8.8.8`
4. Создайте issue на GitHub с описанием ошибки

## ✅ Завершение установки

Поздравляем! Приложение установлено и готово к работе.

**Доступные URL:**
- Frontend: `http://your-domain.com`
- Backend API: `http://your-domain.com/api`
- Archives: `http://your-domain.com/archives`

**Полезные команды:**
```bash
# Перезагрузка всех сервисов
pm2 restart all

# Остановка всех сервисов
pm2 stop all

# Просмотр статуса
pm2 status

# Просмотр логов в реальном времени
pm2 logs -f
```

---

**Последнее обновление:** 16 ноября 2025 г.  
**Версия:** 1.0.0
