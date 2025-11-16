# 📦 TData файлы - Инструкция по подготовке

## 🎯 Что нужно сделать

У вас уже есть структура директорий:
```
admin-bot/tdatas/
├── ru/          (Россия)
├── us/          (США)
└── de/          (Германия)
```

Но директории **пусты**. Нужно добавить туда реальные TData файлы.

## 📋 Структура TData файлов

Каждая страна должна содержать аккаунты в отдельных папках:

```
admin-bot/tdatas/
├── ru/
│   ├── account1/
│   │   ├── session.json       (данные сессии)
│   │   ├── cookies.txt        (cookies)
│   │   ├── profile.json       (профиль)
│   │   └── ...
│   ├── account2/
│   │   └── ...
│   └── account3/
│       └── ...
│
├── us/
│   ├── account1/
│   └── ...
│
└── de/
    ├── account1/
    └── ...
```

## 🚀 Как добавить TData файлы

### Способ 1: Копирование через файловый менеджер

1. Откройте `admin-bot/tdatas/` на вашем компьютере
2. Создайте подпапку для каждого аккаунта:
   ```
   ru/
   ├── account1/
   ├── account2/
   └── ...
   ```
3. Скопируйте TData файлы в каждую папку:
   - `session.json` - данные сессии
   - `cookies.txt` - файл cookies
   - Другие необходимые файлы

### Способ 2: Копирование через терминал

```bash
cd /Users/zootix/Desktop/gift-spin-wheel/admin-bot

# Скопировать TData для России
cp -r /path/to/tdata/ru/* tdatas/ru/

# Скопировать TData для США
cp -r /path/to/tdata/us/* tdatas/us/

# Скопировать TData для Германии
cp -r /path/to/tdata/de/* tdatas/de/
```

### Способ 3: Создание тестовых файлов (для демонстрации)

```bash
# Примеры для тестирования
mkdir -p tdatas/ru/test_account_1 tdatas/us/test_account_1

# Создать фиктивные файлы
echo '{"session":"test"}' > tdatas/ru/test_account_1/session.json
echo '{"cookies":"test"}' > tdatas/ru/test_account_1/cookies.txt

echo '{"session":"test"}' > tdatas/us/test_account_1/session.json
```

## ✅ Проверка что файлы добавлены

```bash
cd /Users/zootix/Desktop/gift-spin-wheel/admin-bot

# Показать все файлы
find tdatas -type f

# Должно показать что-то вроде:
# tdatas/ru/account1/session.json
# tdatas/ru/account1/cookies.txt
# tdatas/ru/account2/session.json
# tdatas/us/account1/session.json
# tdatas/de/account1/session.json
```

## 🧪 Проверка в боте

После добавления файлов:

1. Запустите админ-бота
2. Нажмите `/start`
3. Нажмите **📦 Экспорт TData**
4. Должны появиться кнопки со странами:
   - 📦 RU (3 файлов)
   - 📦 US (1 файлов)
   - 📦 DE (1 файлов)
   - 📦 Экспортировать все

## 🎛️ Поддерживаемые страны

По умолчанию созданы директории для:
- **ru** - Россия
- **us** - США
- **de** - Германия

### Добавление других стран

Если нужны другие страны, просто создайте папку с кодом страны:

```bash
# Добавить Францию
mkdir -p tdatas/fr/account1
cp /path/to/tdata/fr/* tdatas/fr/account1/

# Добавить Украину
mkdir -p tdatas/ua/account1
cp /path/to/tdata/ua/* tdatas/ua/account1/

# Добавить Великобританию
mkdir -p tdatas/uk/account1
cp /path/to/tdata/uk/* tdatas/uk/account1/
```

Система **автоматически** обнаружит новые папки и добавит их в меню!

## 📊 Примеры структуры

### Минимальная структура

```
tdatas/
└── ru/
    └── account1/
        └── session.json          (1 файл)
```

### Стандартная структура

```
tdatas/
└── ru/
    ├── account1/
    │   ├── session.json
    │   ├── cookies.txt
    │   ├── config.json
    │   └── metadata.json
    ├── account2/
    │   └── session.json
    └── account3/
        └── session.json
```

### Расширенная структура

```
tdatas/
├── ru/
│   ├── premium_account/
│   │   ├── session/
│   │   │   ├── auth.json
│   │   │   └── cookies.txt
│   │   ├── data/
│   │   │   ├── profile.json
│   │   │   ├── chats.json
│   │   │   └── contacts.json
│   │   └── config.json
│   └── standard_account/
│       └── session.json
├── us/
│   └── ...
└── de/
    └── ...
```

## 💡 Советы

1. **Организуйте по папкам** - каждый аккаунт в отдельной папке (account1, account2, etc.)
2. **Правильные имена** - используйте коды стран: ru, us, de, fr, uk, jp, cn и т.д.
3. **Проверьте размер** - большие файлы могут замедлить создание архива
4. **Тестируйте** - после добавления файлов попробуйте создать архив
5. **Очищайте старые** - удаляйте архивы из `archives/` периодически

## 🔧 Проверка через Python

```bash
cd admin-bot
python3 << 'EOF'
from utils.tdata_service import TdataService

# Получить список стран с файлами
available = TdataService.get_available_countries()

print("Доступные страны:")
for country, count in available.items():
    print(f"  {country}: {count} файлов")

# Попробовать создать архив
result = TdataService.create_archive('ru')
if result:
    path, name = result
    print(f"\n✅ Архив успешно создан: {name}")
else:
    print("\n❌ Ошибка при создании архива")
EOF
```

## ⚠️ Частые проблемы

### Проблема: "Нет доступных tdata файлов"

**Решение**: Убедитесь что в папках есть файлы:
```bash
# Проверить что файлы есть
find admin-bot/tdatas -type f

# Если файлов нет, добавить их (см. выше)
```

### Проблема: Файлы не появляются в меню

**Решение**: 
1. Убедитесь что перезагрузили бота
2. Проверьте что файлы действительно скопированы:
   ```bash
   ls -la admin-bot/tdatas/ru/
   ls -la admin-bot/tdatas/us/
   ```

### Проблема: Архив слишком большой

**Решение**: Удалите ненужные файлы или разделите на несколько папок

## 📝 Готовая инструкция

Если вы готовы к боевому использованию:

1. ✅ Структура создана (`admin-bot/tdatas/`)
2. ✅ Система работает (протестирована)
3. 📌 Теперь: добавьте реальные TData файлы
4. 🚀 Затем: используйте кнопку "📦 Экспорт TData" в боте

---

**Статус**: ✅ Система готова, ждет TData файлов

Как только добавите файлы в `admin-bot/tdatas/`, сразу сможете создавать архивы!
