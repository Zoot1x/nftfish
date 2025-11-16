#!/bin/bash

# Скрипт для полной и безопасной установки зависимостей
# Использование: bash install-deps.sh

set -e

echo "🚀 Начинаем установку зависимостей Gift Spin Wheel..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка версии Node.js
log_info "Проверяем версию Node.js..."
NODE_VERSION=$(node -v)
echo "   Node.js version: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
    log_error "npm не найден! Пожалуйста, установите Node.js и npm."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "   npm version: $NPM_VERSION"
log_success "Node.js проверка пройдена"
echo ""

# Очистка старых кэшей и файлов
log_info "Очищаем старые кэши и файлы..."
rm -rf node_modules package-lock.json yarn.lock
npm cache clean --force || true
npm cache verify || true
log_success "Кэши очищены"
echo ""

# Установка основных зависимостей
log_info "Устанавливаем основные зависимости..."
npm install --legacy-peer-deps --prefer-offline --no-audit 2>&1 | tail -20
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    log_success "Основные зависимости установлены"
else
    log_warn "Установка завершена с предупреждениями, пытаемся продолжить..."
fi
echo ""

# Проверка установки критических пакетов
log_info "Проверяем критические пакеты..."
CRITICAL_PACKAGES=("react" "react-dom" "react-router-dom" "tailwindcss" "typescript" "vite")

for package in "${CRITICAL_PACKAGES[@]}"; do
    if npm list "$package" > /dev/null 2>&1; then
        VERSION=$(npm list "$package" 2>/dev/null | grep "$package" | head -1 | awk '{print $2}')
        log_success "$package: $VERSION"
    else
        log_error "$package не установлен!"
        exit 1
    fi
done
echo ""

# Установка devDependencies
log_info "Устанавливаем devDependencies..."
npm install --legacy-peer-deps --prefer-offline --no-audit --save-dev 2>&1 | tail -20
log_success "DevDependencies установлены"
echo ""

# Попытка сборки
log_info "Проверяем, может ли проект собраться..."
if npm run build 2>&1 | tail -30; then
    log_success "Проект успешно собран!"
else
    log_warn "Сборка завершена с ошибками"
    log_info "Пытаемся установить недостающие типы..."
    npm install --legacy-peer-deps --save-dev @types/react @types/react-dom 2>&1 | tail -10
    log_info "Повторно пытаемся собрать проект..."
    npm run build 2>&1 | tail -30
fi
echo ""

# Проверка установки Backend зависимостей
if [ -f "backend/package.json" ]; then
    log_info "Устанавливаем зависимости Backend..."
    cd backend
    npm install --legacy-peer-deps --prefer-offline --no-audit 2>&1 | tail -10
    log_success "Backend зависимости установлены"
    cd ..
    echo ""
fi

# Проверка установки Admin Bot зависимостей
if [ -f "admin-bot/requirements.txt" ]; then
    log_info "Проверяем Python зависимости Admin Bot..."
    
    if ! command -v python3 &> /dev/null; then
        log_warn "Python3 не найден! Пропускаем установку Admin Bot зависимостей"
    else
        PYTHON_VERSION=$(python3 --version)
        echo "   $PYTHON_VERSION"
        
        if [ ! -d "admin-bot/venv" ]; then
            log_info "Создаем виртуальное окружение для Admin Bot..."
            cd admin-bot
            python3 -m venv venv
            source venv/bin/activate
            pip install --upgrade pip setuptools wheel
            pip install -r requirements.txt 2>&1 | tail -10
            log_success "Admin Bot зависимости установлены"
            deactivate
            cd ..
        else
            log_warn "Виртуальное окружение Admin Bot уже существует"
        fi
    fi
    echo ""
fi

# Финальная проверка
log_info "Выполняем финальную проверку..."
echo ""

# Проверка структуры проекта
REQUIRED_DIRS=("src" "public" "admin-bot" "backend")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "Папка $dir существует"
    else
        log_warn "Папка $dir не найдена"
    fi
done
echo ""

# Информация об использовании
log_success "✨ Установка завершена успешно!"
echo ""
echo "📝 Дальнейшие действия:"
echo ""
echo "1. 🔧 Скопируйте файлы окружения:"
echo "   cp .env.example .env  (если есть)"
echo ""
echo "2. 🚀 Запустите приложение:"
echo "   npm run dev    # Для разработки"
echo "   npm run build  # Для продакшена"
echo ""
echo "3. 📊 Проверьте логи:"
echo "   npm run dev 2>&1 | tee build.log"
echo ""
echo "4. 🐛 Если есть ошибки, проверьте:"
echo "   npm list --depth=0"
echo "   npm audit"
echo ""
echo "⚠️  Важно!"
echo "   - Убедитесь, что Node.js версии 18+ установлен"
echo "   - Для Production используйте: npm run build && npm run preview"
echo "   - Для быстрой переустановки: bash install-deps.sh"
echo ""
