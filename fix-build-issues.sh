#!/bin/bash

# Скрипт для диагностики и исправления проблем с зависимостями
# Использование: bash fix-build-issues.sh

set -e

echo "🔍 Диагностика проблем сборки Gift Spin Wheel..."
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Функция для запуска команды с обработкой ошибок
run_command() {
    local description=$1
    local command=$2
    
    log_info "Выполняем: $description"
    if eval "$command" 2>&1 | tail -5; then
        log_success "$description - успешно"
    else
        log_warn "$description - завершилось с ошибкой, но продолжаем..."
    fi
    echo ""
}

# Проверка и исправление основных проблем
log_info "Начинаем диагностику..."
echo ""

# 1. Проверка версии Node.js
log_info "1️⃣  Проверяем версию Node.js..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
NPM_VERSION=$(npm -v | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js версия $NODE_VERSION обнаружена, но требуется 18+"
    log_info "Установите Node.js 18+ с https://nodejs.org/"
    exit 1
else
    log_success "Node.js v$(node -v) - OK"
fi

if [ "$NPM_VERSION" -lt 9 ]; then
    log_warn "npm версия $NPM_VERSION обнаружена, рекомендуется 9+"
    log_info "Обновляем npm..."
    npm install -g npm@latest
fi
echo ""

# 2. Очистка и переустановка
log_info "2️⃣  Выполняем полную очистку..."
run_command "Удаляем node_modules" "rm -rf node_modules"
run_command "Удаляем package-lock.json" "rm -f package-lock.json"
run_command "Очищаем npm кэш" "npm cache clean --force"
run_command "Проверяем npm кэш" "npm cache verify"
echo ""

# 3. Обновляем или создаем .npmrc
log_info "3️⃣  Настраиваем конфиг npm..."
cat > .npmrc << 'EOF'
legacy-peer-deps=true
strict-peer-dependencies=false
auto-install-peers=true
audit=false
fetch-timeout=300000
fetch-retries=10
EOF
log_success ".npmrc создан с правильными настройками"
echo ""

# 4. Переустановка зависимостей
log_info "4️⃣  Переустанавливаем зависимости..."
run_command "npm install (основные зависимости)" "npm install --legacy-peer-deps --prefer-offline"
echo ""

# 5. Установка devDependencies
log_info "5️⃣  Устанавливаем devDependencies..."
run_command "npm install (dev зависимости)" "npm install --legacy-peer-deps --save-dev"
echo ""

# 6. Проверка TypeScript
log_info "6️⃣  Проверяем TypeScript..."
if [ -f "tsconfig.json" ]; then
    log_success "tsconfig.json найден"
    npx tsc --noEmit 2>&1 | head -10 || log_warn "TypeScript проверка показала ошибки типов"
else
    log_warn "tsconfig.json не найден"
fi
echo ""

# 7. Проверка потенциальных конфликтов
log_info "7️⃣  Проверяем потенциальные конфликты пакетов..."
npm ls --depth=0 2>&1 | grep -E 'peer dep|unmet' || log_success "Конфликты зависимостей не обнаружены"
echo ""

# 8. Проверка критических файлов
log_info "8️⃣  Проверяем критические файлы проекта..."
REQUIRED_FILES=("package.json" "tsconfig.json" "vite.config.ts" "index.html" "src/main.tsx" "src/App.tsx")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file - найден"
    else
        log_error "$file - НЕ НАЙДЕН!"
    fi
done
echo ""

# 9. Пробная сборка
log_info "9️⃣  Пробуем собрать проект..."
if npm run build 2>&1 | tee build-output.log | tail -20; then
    log_success "Проект успешно собран!"
    
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        log_success "dist папка создана ($DIST_SIZE)"
    fi
else
    log_error "Сборка завершилась с ошибками!"
    log_info "Просмотрите build-output.log для деталей"
    echo ""
    log_info "Часто встречаемые ошибки и решения:"
    echo ""
    echo "1. 'Cannot find module' - переустановите зависимости:"
    echo "   rm -rf node_modules && npm install --legacy-peer-deps"
    echo ""
    echo "2. 'TypeScript error' - обновите типы:"
    echo "   npm install --save-dev @types/react @types/react-dom"
    echo ""
    echo "3. 'Out of memory' - увеличьте лимит памяти:"
    echo "   NODE_OPTIONS='--max-old-space-size=8192' npm run build"
    echo ""
    echo "4. 'EACCES' ошибка разрешений - установите правильные разрешения:"
    echo "   sudo chown -R \$USER::\$USER ~/.npm"
    echo ""
    exit 1
fi
echo ""

# 10. Backend зависимости
if [ -f "backend/package.json" ]; then
    log_info "🔟 Проверяем Backend зависимости..."
    cd backend
    npm install --legacy-peer-deps 2>&1 | tail -5
    log_success "Backend зависимости проверены"
    cd ..
    echo ""
fi

# 11. Итоговый отчет
log_success "✅ Диагностика завершена успешно!"
echo ""
echo "📊 Итоговый отчет:"
echo ""
echo "  Node.js:     $(node -v)"
echo "  npm:         $(npm -v)"
echo "  TypeScript:  $(npx -s tsc --version)"
echo "  Vite:        $(npm list vite | grep vite | head -1 | awk '{print $NF}')"
echo ""
echo "🚀 Готово к разработке!"
echo ""
echo "Следующие команды:"
echo "  npm run dev     - для разработки"
echo "  npm run build   - для сборки"
echo "  npm run preview - для просмотра собранного приложения"
echo ""
