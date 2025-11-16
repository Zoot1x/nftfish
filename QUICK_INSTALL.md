# 🚀 Быстрый старт после git clone

Если вы только что клонировали репозиторий и получаете ошибки при установке, используйте эту инструкцию.

## ⚡ Самое быстрое решение (< 2 минуты)

### Вариант 1: Автоматический скрипт (рекомендуется)

```bash
git clone https://github.com/Zoot1x/nftfish.git gift-spin-wheel
cd gift-spin-wheel

# Одна команда исправляет все проблемы!
bash install-deps.sh
```

### Вариант 2: Ручные команды

```bash
# Установите зависимости с правильными флагами
npm install --legacy-peer-deps

# Соберите проект
npm run build

# Если ошибка памяти:
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

## 🏭 Для Production сервера (Ubuntu 22.04)

```bash
git clone https://github.com/Zoot1x/nftfish.git gift-spin-wheel
cd gift-spin-wheel

# Запустите production скрипт
bash production-setup.sh

# Следуйте инструкциям в терминале
```

## 🔧 Если есть ошибки

### Ошибка: "Cannot find module"

```bash
# Полная переустановка
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Ошибка: "peer dep missing"

```bash
# Это нормально, используйте флаг
npm install --legacy-peer-deps --force
```

### Ошибка: "Out of memory"

```bash
# Увеличьте память Node.js
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

### Ошибка: "EACCES permission denied"

```bash
# На macOS/Linux
sudo chown -R $USER:$USER ~/.npm

# Или используйте NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm use 18
```

## 🧪 Проверка что все работает

```bash
# Проверьте версии
node --version    # Должно быть v18+
npm --version     # Должно быть 9+

# Проверьте что проект собирается
npm run build

# Проверьте что есть dist папка
ls -la dist/
```

## 🐛 Диагностика при проблемах

Если простые решения не помогли:

```bash
# Запустите диагностический скрипт
bash fix-build-issues.sh

# Он автоматически исправит:
# ✓ Очистит кэши
# ✓ Переустановит все пакеты
# ✓ Проверит конфликты
# ✓ Попытается собрать проект
# ✓ Выдаст подробный отчет
```

## 📋 Что исправлено в пакетах

- ✅ Добавлены все недостающие зависимости
- ✅ Исправлены версии для совместимости
- ✅ Добавлен правильный `.npmrc` конфиг
- ✅ Созданы скрипты для автоматической установки
- ✅ Добавлена поддержка legacy peer deps

## 🚀 Дальнейшие действия

```bash
# 1. Скопируйте конфиг
cp .env.example .env
# Отредактируйте .env с вашими данными

# 2. Запустите в разработке
npm run dev

# 3. Или соберите для production
npm run build && npm run preview
```

## 📞 Остались вопросы?

Смотрите подробные инструкции:
- `INSTALL_TROUBLESHOOTING.md` - решение проблем
- `UBUNTU_22_SETUP.md` - полная установка на сервер

---

**Все работает!** ✅ Приложение готово к разработке или развертыванию.
