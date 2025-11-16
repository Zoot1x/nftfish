# 🚀 Быстрая установка зависимостей

Если вы столкнулись с ошибками при установке зависимостей, используйте эти скрипты.

## ⚡ Быстрое решение (1 минута)

```bash
bash install-deps.sh
```

Этот скрипт автоматически:
- ✅ Проверит версию Node.js (требуется 18+)
- ✅ Очистит кэши npm
- ✅ Переустановит все зависимости
- ✅ Установит devDependencies
- ✅ Попытается собрать проект
- ✅ Установит Python зависимости (если нужны)

## 🔍 Диагностика и исправление (для сложных случаев)

```bash
bash fix-build-issues.sh
```

Этот скрипт:
- 🔎 Проверит Node.js версию
- 🧹 Выполнит глубокую очистку
- 📦 Переустановит все зависимости
- ✓ Проверит TypeScript конфигурацию
- ⚙️ Проверит конфликты пакетов
- 🏗️ Попытается собрать проект
- 📊 Выдаст подробный отчет

## 🔧 Ручное решение (если скрипты не помогли)

### Шаг 1: Проверьте версию Node.js
```bash
node --version  # Должно быть v18.0.0 или выше
npm --version   # Должно быть 9.0.0 или выше
```

Если версия старая, установите Node.js с https://nodejs.org/

### Шаг 2: Полная переустановка
```bash
# Очистите все
rm -rf node_modules package-lock.json yarn.lock
npm cache clean --force

# Обновите npm (опционально)
npm install -g npm@latest

# Переустановите зависимости
npm install --legacy-peer-deps
```

### Шаг 3: Установите недостающие типы
```bash
npm install --save-dev @types/react @types/react-dom @types/node
```

### Шаг 4: Попробуйте собрать
```bash
npm run build
```

### Шаг 5: Если память закончилась
```bash
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

## 📋 Часто встречаемые ошибки и решения

### ❌ "Cannot find module 'react'"
**Решение:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### ❌ "peer dep missing"
**Решение:**
```bash
npm install --legacy-peer-deps --force
```

### ❌ "TypeScript error TS2307: Cannot find module"
**Решение:**
```bash
npm install --save-dev @types/react @types/react-dom
npx tsc --skipLibCheck
```

### ❌ "JavaScript heap out of memory"
**Решение:**
```bash
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

### ❌ "EACCES: permission denied"
**Решение:**
```bash
# На macOS/Linux
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules

# Или используйте NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm use 18
```

### ❌ "404 Not Found - npm ERR! 404 Not Found"
**Решение:**
```bash
npm install --legacy-peer-deps --registry https://registry.npmjs.org/
```

### ❌ "ETIMEDOUT / ECONNREFUSED"
**Решение:**
```bash
# Увеличьте timeout
npm install --fetch-timeout=300000 --fetch-retries=10
```

## ✅ Проверка установки

После установки проверьте, что все работает:

```bash
# Проверка версий
npm -v
node -v
npx tsc --version

# Проверка пакетов
npm list react
npm list typescript
npm list tailwindcss

# Пробная сборка
npm run build

# Проверка dist папки
ls -la dist/
```

## 🐍 Python зависимости (для Admin Bot)

```bash
cd admin-bot

# Создаем виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Проверка
python3 -c "import aiogram; print(aiogram.__version__)"
```

## 🆘 Если ничего не помогает

1. **Полная переустановка Node.js:**
   ```bash
   # Удалите Node.js полностью
   # Переустановите с https://nodejs.org/ (LTS версия 18+)
   ```

2. **Используйте NVM (рекомендуется):**
   ```bash
   # Установка NVM
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Использование правильной версии
   nvm install 18
   nvm use 18
   
   # Теперь переустановите зависимости
   npm install --legacy-peer-deps
   ```

3. **Очистите DNS кэш:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemctl restart systemd-resolved
   ```

4. **Проверьте интернет соединение:**
   ```bash
   npm ping
   ```

## 📞 Если проблема остается

Создайте issue с следующей информацией:

```
OS: [macOS / Linux / Windows]
Node: [version output]
npm: [version output]
Error: [полный текст ошибки]
Output: [последние 50 строк npm run build]
```

Запустите для сбора информации:
```bash
echo "=== System Info ===" && \
echo "OS: $(uname -s)" && \
echo "Node: $(node --version)" && \
echo "npm: $(npm --version)" && \
echo "" && \
echo "=== npm audit ===" && \
npm audit --json 2>&1 | head -50
```

## 💡 Советы для Production

При установке на продакшен сервер:

```bash
# Используйте --production флаг
npm install --production --legacy-peer-deps

# Кэшируйте зависимости
npm ci --legacy-peer-deps

# Проверьте безопасность
npm audit
npm audit fix
```

---

**Версия:** 1.0.0  
**Последнее обновление:** 16 ноября 2025
