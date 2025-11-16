#!/bin/bash

# Production установка Gift Spin Wheel
# Использование: bash production-setup.sh

set -e

echo "🏭 Production Setup - Gift Spin Wheel"
echo "===================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# 1. Проверка требований
log_info "1. Проверяем требования..."

if ! command -v node &> /dev/null; then
    log_error "Node.js не найден!"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js должен быть версии 18+, обнаружена версия $NODE_VERSION"
    exit 1
fi

log_success "Node.js: $(node -v)"
log_success "npm: $(npm -v)"
echo ""

# 2. Очистка
log_info "2. Очищаем старые установки..."
rm -rf node_modules dist build .next out
npm cache clean --force || true
log_success "Очистка завершена"
echo ""

# 3. Установка с optimizations
log_info "3. Устанавливаем зависимости (Production mode)..."
npm ci --legacy-peer-deps --prefer-offline --no-audit 2>&1 | grep -E "added|up to date" || true
log_success "Зависимости установлены"
echo ""

# 4. Сборка
log_info "4. Собираем проект..."
export NODE_OPTIONS='--max-old-space-size=8192'
npm run build
log_success "Сборка успешно завершена"
echo ""

# 5. Проверка dist
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    FILE_COUNT=$(find dist -type f | wc -l)
    log_success "dist размер: $DIST_SIZE ($FILE_COUNT файлов)"
else
    log_error "dist папка не создана!"
    exit 1
fi
echo ""

# 6. Backend
if [ -f "backend/package.json" ]; then
    log_info "5. Устанавливаем Backend зависимости..."
    cd backend
    npm ci --legacy-peer-deps --prefer-offline --no-audit 2>&1 | grep -E "added|up to date" || true
    log_success "Backend зависимости установлены"
    cd ..
    echo ""
fi

# 7. Admin Bot
if [ -f "admin-bot/requirements.txt" ]; then
    log_info "6. Проверяем Admin Bot..."
    
    if ! command -v python3 &> /dev/null; then
        log_warn "Python3 не найден, пропускаем Admin Bot"
    else
        cd admin-bot
        
        if [ ! -d "venv" ]; then
            log_info "Создаем Python окружение..."
            python3 -m venv venv
            source venv/bin/activate
            pip install --quiet --upgrade pip
            pip install --quiet -r requirements.txt
            log_success "Admin Bot окружение готово"
            deactivate
        else
            log_success "Admin Bot окружение уже существует"
        fi
        
        cd ..
    fi
    echo ""
fi

# 8. Проверка файлов
log_info "7. Проверяем конфигурацию..."

if [ ! -f ".env" ]; then
    log_warn ".env файл не найден"
    log_info "Создаем шаблон .env..."
    cat > .env.example << 'EOF'
# Frontend
VITE_API_URL=http://localhost:3001
VITE_BOT_TOKEN=YOUR_BOT_TOKEN
VITE_CHANNEL_ID=YOUR_CHANNEL_ID

# Backend
PORT=3001
NODE_ENV=production
BOT_TOKEN=YOUR_BOT_TOKEN
ADMIN_ID=YOUR_ADMIN_ID
CHANNEL_ID=YOUR_CHANNEL_ID

# Database (optional)
DATABASE_URL=
EOF
    log_info "Пожалуйста, создайте .env файл на основе .env.example"
else
    log_success ".env файл существует"
fi

echo ""

# 9. Финальная проверка
log_info "8. Финальная проверка..."

REQUIRED_FILES=("dist/index.html" "backend/server.js" ".env" ".npmrc")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file ✓"
    elif [ "$file" = ".env" ]; then
        log_warn "$file - требует конфигурации"
    else
        log_error "$file - НЕ НАЙДЕН!"
    fi
done

echo ""

# 10. Размер
log_info "9. Статистика сборки..."
echo "  dist: $(du -sh dist | cut -f1)"
echo "  node_modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'N/A')"
echo "  Всего: $(du -sh . --exclude=.git --exclude=node_modules | cut -f1)"
echo ""

# 11. Команды для запуска
log_success "✨ Production установка завершена!"
echo ""
echo "🚀 Команды для запуска:"
echo ""
echo "  # Разработка"
echo "  npm run dev"
echo ""
echo "  # Production сборка"
echo "  npm run build && npm run preview"
echo ""
echo "  # С использованием PM2"
echo "  npm install -g pm2"
echo "  pm2 start ecosystem.config.js"
echo ""
echo "📋 Следующие действия:"
echo ""
echo "  1. Отредактируйте .env файл:"
echo "     nano .env"
echo ""
echo "  2. Убедитесь, что все переменные установлены:"
echo "     - VITE_BOT_TOKEN"
echo "     - VITE_CHANNEL_ID"
echo "     - BOT_TOKEN"
echo "     - ADMIN_ID"
echo ""
echo "  3. Запустите приложение:"
echo "     npm run build && npm run preview"
echo ""
echo "⚙️  Для Production используйте:"
echo ""
echo "  - Nginx reverse proxy"
echo "  - SSL сертификат (Let's Encrypt)"
echo "  - Process manager (PM2 или systemd)"
echo "  - Регулярные резервные копии"
echo ""
echo "📚 Смотрите UBUNTU_22_SETUP.md для полной инструкции"
echo ""
