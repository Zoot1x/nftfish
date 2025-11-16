# 📦 Система экспорта TData - Документация

## Обзор

Новая система позволяет создавать ZIP архивы с TData файлами и предоставлять ссылки для скачивания через админ-бота.

## Компоненты

### 1. TdataService (utils/tdata_service.py)

**Основные методы:**

```python
# Получить доступные страны и количество файлов
available = TdataService.get_available_countries()
# Результат: {'ru': 5, 'us': 3, ...}

# Создать архив для конкретной страны
result = TdataService.create_archive('ru')
# Результат: (archive_path, archive_name) или None

# Создать архив всех TData файлов
result = TdataService.create_all_archive()
# Результат: (archive_path, archive_name) или None

# Получить информацию об архиве
info = TdataService.get_archive_info(archive_path)
# Результат: {
#   'name': 'tdata_ru_20251116_120000.zip',
#   'path': '/path/to/archive.zip',
#   'size_bytes': 1024000,
#   'size_mb': 1.0,
#   'created': '2025-11-16T12:00:00'
# }

# Очистить старые архивы (оставить последние N)
TdataService.cleanup_old_archives(keep_count=10)

# Сгенерировать URL для скачивания
url = TdataService.get_download_url('tdata_ru_20251116_120000.zip')
# Результат: http://localhost:8000/archives/tdata_ru_20251116_120000.zip
```

**Директории:**

- `admin-bot/tdatas/` - исходные TData файлы по странам
- `admin-bot/archives/` - созданные ZIP архивы

### 2. Обработчики (handlers/tdata.py)

**Обработчики callback-ов:**

1. `tdata_export_handler()` - показывает меню экспорта
2. `tdata_export_country_handler()` - экспортирует TData конкретной страны
3. `tdata_export_all_handler()` - экспортирует все TData файлы

### 3. Клавиатуры (utils/keyboards.py)

```python
# Получить клавиатуру экспорта с доступными странами
kb = tdata_export_keyboard()
# Кнопки:
# - 📦 RU (5 файлов)
# - 📦 US (3 файла)
# - 📦 Экспортировать все
# - « Назад
```

### 4. Backend API (backend/server.js)

Express.js сервер раздает архивы по маршруту `/archives/`:

```javascript
// URL для скачивания
http://localhost:3001/archives/tdata_ru_20251116_120000.zip

// Настройка в server.js:
app.use('/archives', express.static(archivesPath));
```

## Процесс работы

### 1. Пользователь нажимает "📦 Экспорт TData"

```
Главное меню
  ↓
💰 Продажа  |  📦 Экспорт TData  |  📊 Статистика
  ↓
Меню экспорта с доступными странами
```

### 2. Выбирает страну или "Экспортировать все"

```
📦 Экспорт TData
Доступные страны:
• RU: 5 файлов
• US: 3 файла

[📦 RU (5 файлов)]
[📦 US (3 файла)]
[📦 Экспортировать все]
[« Назад]
```

### 3. Система создает архив

```
Backend:
1. Находит все файлы для страны
2. Создает ZIP архив с timestamp
3. Сохраняет в /archives/
4. Возвращает путь и имя файла
```

### 4. Бот отправляет ссылку для скачивания

```
✅ TData архив создан

Страна: RU
Размер: 2.45 МБ
Файл: tdata_ru_20251116_120000.zip

📥 Скачать архив
```

## Использование

### Запуск

```bash
# Убедитесь что backend запущен
cd backend
npm start

# Запустите админ-бота
cd admin-bot
python3 bot.py
```

### Структура файлов

```
admin-bot/
├── tdatas/                          # TData файлы
│   ├── ru/
│   │   ├── account1/
│   │   └── account2/
│   └── us/
│       ├── account3/
│       └── account4/
├── archives/                        # Созданные архивы
│   ├── tdata_ru_20251116_120000.zip
│   ├── tdata_us_20251116_130000.zip
│   └── tdata_all_20251116_140000.zip
└── handlers/
    ├── tdata.py                     # Обработчики
```

### Создание архива вручную (Python)

```python
from utils.tdata_service import TdataService

# Для конкретной страны
result = TdataService.create_archive('ru')
if result:
    archive_path, archive_name = result
    print(f"✅ Архив создан: {archive_name}")
    
    # Получить информацию
    info = TdataService.get_archive_info(archive_path)
    print(f"Размер: {info['size_mb']} МБ")
    
    # Получить URL для скачивания
    url = TdataService.get_download_url(archive_name, 
                                        base_url="https://your-domain.com")
    print(f"Скачать: {url}")

# Для всех стран
result = TdataService.create_all_archive()

# Очистить старые архивы
TdataService.cleanup_old_archives(keep_count=10)
```

## Конфигурация

### Изменение базового URL для скачивания

В `utils/tdata_service.py`:

```python
# По умолчанию
url = TdataService.get_download_url(archive_name)
# Результат: http://localhost:8000/archives/...

# С пользовательским URL
url = TdataService.get_download_url(
    archive_name, 
    base_url="https://api.example.com"
)
# Результат: https://api.example.com/archives/...
```

### Изменение количества хранимых архивов

В `handlers/tdata.py`:

```python
# По умолчанию 5 архивов
TdataService.cleanup_old_archives(keep_count=5)

# Увеличить до 20
TdataService.cleanup_old_archives(keep_count=20)
```

## Интеграция с фронтенда

### 1. Получить список доступных стран

```bash
curl http://localhost:3001/api/tdata/available
```

Или через админ-бота (сообщение с кнопками).

### 2. Создать архив через API

```bash
# Для конкретной страны
curl -X POST http://localhost:3001/api/tdata/export \
  -H "Content-Type: application/json" \
  -d '{"country": "ru"}'

# Для всех стран
curl -X POST http://localhost:3001/api/tdata/export-all
```

### 3. Скачать архив

```html
<!-- Прямая ссылка -->
<a href="http://localhost:3001/archives/tdata_ru_20251116_120000.zip">
  Скачать RU архив
</a>

<!-- Через fetch -->
fetch('http://localhost:3001/archives/tdata_ru_20251116_120000.zip')
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tdata_ru.zip';
    a.click();
  });
```

## Безопасность

### Рекомендации

1. **Аутентификация**: Ограничить доступ к `/archives` только авторизованным пользователям
2. **Квоты**: Ограничить размер архивов
3. **Логирование**: Отслеживать скачивания
4. **Удаление**: Автоматически удалять архивы старше N дней

### Пример защиты в Express.js

```javascript
// Только авторизованные пользователи
app.use('/archives', authenticateUser, express.static(archivesPath));

// Ограничение по размеру
app.post('/api/tdata/export', (req, res) => {
  // Проверить размер перед созданием
  const maxSize = 500 * 1024 * 1024; // 500 МБ
  const estimatedSize = calculateSize(req.body.country);
  
  if (estimatedSize > maxSize) {
    return res.status(413).json({ error: 'Archive too large' });
  }
  // ...
});
```

## Устранение неполадок

### Архив не создается

1. Проверьте наличие файлов в `admin-bot/tdatas/`:
```bash
ls -la admin-bot/tdatas/
```

2. Проверьте права доступа:
```bash
chmod -R 755 admin-bot/tdatas/
chmod -R 755 admin-bot/archives/
```

3. Проверьте логи бота в консоли.

### Ссылка не работает

1. Убедитесь что backend запущен:
```bash
curl http://localhost:3001/health
```

2. Проверьте корректность пути в `server.js`

3. Попробуйте скачать вручную:
```bash
curl -O http://localhost:3001/archives/tdata_ru_20251116_120000.zip
```

### Архивы очень большие

1. Используйте `cleanup_old_archives()` для удаления старых
2. Увеличьте интервал сжатия
3. Разделите на несколько архивов по странам

## API Endpoints (для будущей реализации)

| Метод | Эндпоинт | Описание |
|-------|----------|---------|
| GET | `/api/tdata/available` | Список доступных стран |
| POST | `/api/tdata/export` | Создать архив страны |
| POST | `/api/tdata/export-all` | Создать архив всех |
| GET | `/archives/:filename` | Скачать архив |
| DELETE | `/api/tdata/archives/:id` | Удалить архив |

## Версия

**Версия**: 1.0  
**Дата создания**: 16 ноября 2025  
**Статус**: ✅ Готово к использованию
