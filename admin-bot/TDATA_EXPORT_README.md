# 📦 TData Export System

> Система для создания ZIP архивов с TData файлами и предоставления ссылок для скачивания через админ-бота Telegram.

## 🎯 Возможности

✅ **Динамическое создание архивов** - архивы создаются на лету  
✅ **Поддержка нескольких стран** - раздельные архивы для каждой страны  
✅ **Экспорт всех файлов** - одна кнопка для архивирования всех TData  
✅ **Прямые ссылки** - ссылки для скачивания отправляются прямо в бот  
✅ **Автоочистка** - старые архивы удаляются автоматически  
✅ **Информация об архивах** - показывается размер и время создания  

## 📋 Содержимое

### Исходный код

```
admin-bot/
├── utils/
│   └── tdata_service.py        # Сервис создания архивов (170 строк)
├── handlers/
│   └── tdata.py                # Обработчики callback-ов (95 строк)
├── tdatas/                     # INPUT: TData файлы по странам
│   ├── ru/                     # Russian tdata
│   ├── us/                     # US tdata
│   └── ...                     # другие страны
└── archives/                   # OUTPUT: созданные архивы

backend/
└── server.js                   # Express сервер раздачи файлов
```

### Документация

| Файл | Описание |
|------|---------|
| `TDATA_EXPORT.md` | Полная техническая документация |
| `TDATA_EXPORT_QUICKSTART.md` | Быстрый старт и примеры |
| `TDATA_EXPORT_IMPLEMENTATION.md` | Архитектура и сводка |

## 🚀 Быстрый старт

### 1. Подготовка TData

```bash
# Создайте структуру директорий
mkdir -p admin-bot/tdatas/ru
mkdir -p admin-bot/tdatas/us
mkdir -p admin-bot/tdatas/de
# ... и т.д. для других стран

# Поместите TData файлы в соответствующие директории
# admin-bot/tdatas/ru/ ← тут TData аккаунты для России
# admin-bot/tdatas/us/ ← тут TData аккаунты для США
```

### 2. Запуск backend

```bash
cd backend
npm start
```

**Вывод:**
```
✅ Backend running on http://localhost:3001
📱 Auth API available at http://localhost:3001/api/auth
```

### 3. Запуск админ-бота

```bash
cd admin-bot
python3 bot.py
```

### 4. Использование

1. Откройте чат с админ-ботом
2. Отправьте `/start` или нажмите меню
3. Нажмите **📦 Экспорт TData**
4. Выберите страну или **Экспортировать все**
5. Получите ссылку для скачивания

## 📱 Интерфейс

### Главное меню

```
[📊 Статистика логов]
[💰 Продажа]
[📦 Экспорт TData] ← ВАШ НОВЫЙ ПУНКТ
```

### Меню экспорта

```
📦 Экспорт TData
Доступные страны:
• RU: 5 файлов
• US: 3 файла
• DE: 2 файла

[📦 RU (5 файлов)]
[📦 US (3 файла)]
[📦 DE (2 файла)]
[📦 Экспортировать все]
[« Назад]
```

### Результат

```
✅ TData архив создан

Страна: RU
Размер: 2.45 МБ
Файл: tdata_ru_20251116_120000.zip

📥 Скачать архив
```

## 🔧 API

### TdataService

```python
from utils.tdata_service import TdataService

# Получить доступные страны
countries = TdataService.get_available_countries()
# {'ru': 5, 'us': 3, 'de': 2}

# Создать архив для страны
result = TdataService.create_archive('ru')
if result:
    archive_path, archive_name = result
    # archive_name = 'tdata_ru_20251116_120000.zip'

# Информация об архиве
info = TdataService.get_archive_info(archive_path)
# {
#   'name': 'tdata_ru_20251116_120000.zip',
#   'size_mb': 2.45,
#   'created': '2025-11-16T12:00:00'
# }

# Сгенерировать URL
url = TdataService.get_download_url(archive_name)
# 'http://localhost:3001/archives/tdata_ru_20251116_120000.zip'

# Очистить старые архивы
TdataService.cleanup_old_archives(keep_count=10)
```

### Backend API

```javascript
// Раздача архивов
GET /archives/<filename>

// Пример скачивания
curl -O http://localhost:3001/archives/tdata_ru_20251116_120000.zip
```

## 💡 Примеры

### Пример 1: Создание архива через Python

```python
from utils.tdata_service import TdataService

# Создать архив
result = TdataService.create_archive('ru')

if result:
    path, name = result
    info = TdataService.get_archive_info(path)
    
    print(f"✅ Архив создан: {name}")
    print(f"Размер: {info['size_mb']} МБ")
    
    # Получить ссылку
    url = TdataService.get_download_url(name, 
                                        base_url="https://api.example.com")
    print(f"Скачать: {url}")
```

### Пример 2: Интеграция с S3

```python
import boto3
from utils.tdata_service import TdataService

# Создать архив
result = TdataService.create_archive('ru')
if result:
    archive_path, archive_name = result
    
    # Загрузить в S3
    s3 = boto3.client('s3')
    s3.upload_file(
        archive_path,
        'my-bucket',
        f'tdata/{archive_name}'
    )
    
    # Получить публичную ссылку
    url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': 'my-bucket', 'Key': f'tdata/{archive_name}'},
        ExpiresIn=86400  # 24 часа
    )
```

### Пример 3: Автоматическая очистка

```python
import schedule
import time
from utils.tdata_service import TdataService

def cleanup():
    TdataService.cleanup_old_archives(keep_count=10)
    print("✅ Старые архивы удалены")

# Запустить очистку каждый час
schedule.every(1).hour.do(cleanup)

while True:
    schedule.run_pending()
    time.sleep(1)
```

## ⚙️ Конфигурация

### Изменение базового URL

**Файл**: `admin-bot/utils/tdata_service.py`

```python
def get_download_url(cls, archive_name: str, 
                    base_url: str = "http://localhost:3001"):
    # ← измените на ваш URL
    return f"{base_url}/archives/{archive_name}"
```

### Изменение порта backend

**Файл**: `backend/server.js`

```javascript
const PORT = process.env.PORT || 3001;  // ← измените на другой порт
```

### Количество хранимых архивов

**Файл**: `admin-bot/handlers/tdata.py`

```python
TdataService.cleanup_old_archives(keep_count=5)  # ← измените значение
```

## 🔐 Безопасность

### Рекомендации

1. **Аутентификация**: Ограничить доступ к `/archives` только авторизованным
2. **Квоты**: Ограничить максимальный размер архивов
3. **Логирование**: Отслеживать все скачивания
4. **Очистка**: Удалять архивы старше N дней

### Пример защиты

```javascript
// middleware для проверки токена
app.use('/archives', authenticateToken, express.static(archivesPath));

// Проверка размера
app.post('/api/tdata/export', (req, res) => {
  const MAX_SIZE = 500 * 1024 * 1024; // 500 МБ
  const estimatedSize = getEstimatedSize(req.body.country);
  
  if (estimatedSize > MAX_SIZE) {
    return res.status(413).json({ error: 'Archive too large' });
  }
});
```

## 📊 Мониторинг

### Проверка работы

```bash
# Проверить что backend запущен
curl http://localhost:3001/health
# Ответ: {"status":"ok"}

# Проверить что архивы раздаются
curl -I http://localhost:3001/archives/

# Список созданных архивов
ls -lh admin-bot/archives/

# Размер архивов
du -sh admin-bot/archives/
```

### Логирование

```python
# TdataService выводит логи
print(f"✅ Archive created: {archive_path}")
print(f"❌ Error creating archive: {e}")
print(f"Deleted old archive: {archive.name}")
```

## 🐛 Устранение неполадок

### Архив не создается

```bash
# 1. Проверьте наличие файлов
ls -la admin-bot/tdatas/

# 2. Проверьте права доступа
chmod -R 755 admin-bot/tdatas/
chmod -R 755 admin-bot/archives/

# 3. Проверьте логи
# Смотрите вывод консоли админ-бота
```

### Ссылка не работает

```bash
# 1. Проверьте backend
curl http://localhost:3001/health

# 2. Попробуйте скачать напрямую
curl -O http://localhost:3001/archives/tdata_ru_20251116_120000.zip

# 3. Проверьте что файл существует
ls admin-bot/archives/
```

### Архивы занимают слишком много места

```python
# Уменьшите количество хранимых архивов
TdataService.cleanup_old_archives(keep_count=5)

# Или удалите старые вручную
rm admin-bot/archives/tdata_*.zip
```

## 🔮 Планы развития

- [ ] REST API для создания архивов
- [ ] Прямая загрузка в облако (S3, Google Drive)
- [ ] Шифрование архивов
- [ ] Уведомления при готовности
- [ ] Истечение ссылок на 24 часа
- [ ] Статистика скачиваний
- [ ] Веб-интерфейс для управления

## 📞 Поддержка

Если что-то не работает:

1. Проверьте логи бота (консоль)
2. Проверьте что backend запущен
3. Проверьте структуру файлов
4. Проверьте права доступа
5. Прочитайте документацию в `TDATA_EXPORT.md`

## 📚 Документация

- **TDATA_EXPORT.md** - Полная техническая документация (9.8 KB)
- **TDATA_EXPORT_QUICKSTART.md** - Быстрый старт (7.8 KB)
- **TDATA_EXPORT_IMPLEMENTATION.md** - Архитектура (10.0 KB)

## 🎉 Готово!

Система полностью реализована и протестирована. Просто добавьте TData файлы и начните использовать!

---

**Версия**: 1.0  
**Дата создания**: 16 ноября 2025  
**Статус**: ✅ Production Ready  
**Лицензия**: MIT
