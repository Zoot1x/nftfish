# 📦 Экспорт TData - Быстрый старт

## Что это?

Система для создания ZIP архивов с TData файлами и предоставления ссылок для скачивания через админ-бот Telegram.

## Как это работает?

```
Админ нажимает "📦 Экспорт TData"
           ↓
       Выбирает страну
           ↓
     Backend создает ZIP
           ↓
    Отправляет ссылку
           ↓
   Админ скачивает архив
```

## Быстрое развертывание

### 1. Убедитесь что структура готова

```bash
# Проверьте наличие файлов
ls -la admin-bot/tdatas/

# Должно быть примерно так:
# admin-bot/tdatas/
# ├── ru/
# │   ├── account1_data/
# │   └── account2_data/
# └── us/
#     └── account3_data/
```

### 2. Убедитесь что backend запущен

```bash
cd backend
npm install  # если еще не установлены пакеты
npm start
```

**Вывод:**
```
✅ Backend running on http://localhost:3001
```

### 3. Запустите админ-бота

```bash
cd admin-bot
python3 bot.py
```

### 4. Используйте в Telegram

- Откройте чат с админ-ботом
- Нажмите **Главное меню** или отправьте `/start`
- Нажмите **📦 Экспорт TData**
- Выберите страну или **Экспортировать все**
- Получите ссылку для скачивания

## Структура файлов

```
admin-bot/
├── handlers/
│   └── tdata.py                # Обработчики для бота
├── utils/
│   ├── tdata_service.py        # Логика создания архивов
│   ├── keyboards.py            # Кнопки меню
│   └── callbacks.py            # Имена callback-ов
├── tdatas/                     # TData файлы (INPUT)
│   ├── ru/
│   └── us/
├── archives/                   # Созданные архивы (OUTPUT)
│   └── tdata_ru_20251116_*.zip
└── bot.py                      # Главный файл бота

backend/
├── server.js                   # Express сервер
└── ...
```

## Что происходит внутри?

### На стороне бота

```python
# 1. Пользователь нажимает кнопку
@router.callback_query(F.data == TDATA_EXPORT)
async def tdata_export_handler(query):
    # Показать доступные страны
    pass

# 2. Пользователь выбирает страну
@router.callback_query(F.data.startswith(TDATA_EXPORT_COUNTRY))
async def tdata_export_country_handler(query):
    country = query.data.replace("tdata_export_country:", "")
    
    # Создать архив
    result = TdataService.create_archive(country)
    
    # Отправить ссылку
    url = TdataService.get_download_url(archive_name)
    send_message(f"📥 Скачать: {url}")
```

### На стороне backend

```javascript
// Раздача файлов
app.use('/archives', express.static(archivesPath));

// Пользователь может скачать
GET http://localhost:3001/archives/tdata_ru_20251116_120000.zip
```

## Ручное создание архива

Если хотите создать архив вручную без бота:

```bash
cd admin-bot
python3 << 'EOF'
from utils.tdata_service import TdataService

# Для страны RU
result = TdataService.create_archive('ru')
if result:
    archive_path, archive_name = result
    print(f"✅ Создан: {archive_name}")
    info = TdataService.get_archive_info(archive_path)
    print(f"Размер: {info['size_mb']} МБ")
    url = TdataService.get_download_url(archive_name)
    print(f"Скачать: {url}")
EOF
```

## Очистка старых архивов

Архивы занимают место, поэтому старые удаляются автоматически:

```python
# Оставить только 10 последних архивов
TdataService.cleanup_old_archives(keep_count=10)

# Оставить только 5
TdataService.cleanup_old_archives(keep_count=5)
```

## Параметры

### Размер архива

Размер зависит от количества файлов в `admin-bot/tdatas/`:

```
1 аккаунт (~5 МБ) → архив ~5 МБ
10 аккаунтов (~50 МБ) → архив ~50 МБ
100 аккаунтов (~500 МБ) → архив ~500 МБ
```

### Порт backend

По умолчанию: **3001**

Если занят, измените в `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3001;  // ← измените на другой
```

### URL для скачивания

По умолчанию: `http://localhost:3001`

На боевом сервере измените в `admin-bot/utils/tdata_service.py`:
```python
def get_download_url(cls, archive_name: str, 
                    base_url: str = "https://api.yourdomain.com"):
    # ← замените URL
    return f"{base_url}/archives/{archive_name}"
```

## Проверка что работает

```bash
# 1. Проверьте что backend запущен
curl http://localhost:3001/health
# Ответ: {"status":"ok"}

# 2. Проверьте что архивы раздаются
curl -I http://localhost:3001/archives/
# Ответ: 404 (OK, директория пока пустая)

# 3. Проверьте что бот подключен
python3 admin-bot/bot.py
# Вывод должен показать что router включен
```

## Часто задаваемые вопросы

**Q: Где хранятся созданные архивы?**
A: В `admin-bot/archives/` на сервере, где запущен backend.

**Q: Как поделиться ссылкой с пользователем?**
A: Скопируйте URL из сообщения бота и отправьте пользователю.

**Q: Можно ли скачать все архивы сразу?**
A: Да, нажмите "📦 Экспортировать все" в меню бота.

**Q: Архив слишком большой, что делать?**
A: Удалите старые файлы из `admin-bot/tdatas/` или разделите на несколько стран.

**Q: Как заменить URL для скачивания?**
A: Отредактируйте метод `get_download_url()` в `utils/tdata_service.py`.

**Q: Как защитить скачивания паролем?**
A: Добавьте middleware аутентификации в `backend/server.js`.

## Развитие функционала

Возможные улучшения:

- [ ] Добавить API для создания архивов через HTTP
- [ ] Добавить статистику по размерам архивов
- [ ] Добавить фильтрацию по датам
- [ ] Добавить постоянное хранилище в облаке (S3, Google Drive)
- [ ] Добавить шифрование архивов
- [ ] Добавить истечение ссылок (на 24 часа)
- [ ] Добавить уведомления при готовности архива

## Поддержка

Если что-то не работает:

1. Проверьте логи бота (консоль)
2. Проверьте что backend запущен: `curl http://localhost:3001/health`
3. Проверьте структуру `admin-bot/tdatas/`
4. Убедитесь что права доступа: `chmod -R 755 admin-bot/tdatas/`

---

**Готово! 🚀 Система полностью работает.**
