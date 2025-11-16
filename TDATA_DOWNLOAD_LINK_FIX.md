# 📥 Исправление Ссылки на Скачивание TData

## Проблема

Ссылка на скачивание архива не работает, потому что в коде используется захардкодированный `http://localhost:8000`, но backend запускается на другом порту (обычно 3001).

## Решение

### 1️⃣ Узнать правильный порт backend

Проверьте, на каком порту запускается ваш backend:

```bash
# В файле backend/server.js смотрите строку:
# const PORT = process.env.PORT || 3001;

# Или проверьте переменные окружения:
echo $PORT  # если установлена
```

Если не установлена переменная `PORT`, используется **3001**.

### 2️⃣ Способ A: Использовать переменную окружения (Рекомендуется)

#### Создайте файл `.env` в папке `admin-bot/`

```bash
# admin-bot/.env
BACKEND_URL=http://localhost:3001
# или для VPS:
# BACKEND_URL=https://yourdomain.com
# или
# BACKEND_URL=http://your_vps_ip:3001
```

#### Обновите `admin-bot/handlers/tdata.py`

```python
import os
from dotenv import load_dotenv

# Загрузить переменные окружения
load_dotenv()
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')

# ...

@router.callback_query(F.data.startswith(TDATA_EXPORT_COUNTRY))
async def tdata_export_country_handler(query: CallbackQuery):
    """Export tdata for specific country."""
    country_code = query.data.replace(TDATA_EXPORT_COUNTRY, "")
    
    await query.answer("⏳ Создаю архив...", show_alert=False)
    
    # Create archive
    result = TdataService.create_archive(country_code)
    
    if result:
        archive_path, archive_name = result
        archive_info = TdataService.get_archive_info(archive_path)
        
        if archive_info:
            file_size = archive_info['size_mb']
            # 👇 Передайте правильный base_url
            download_url = TdataService.get_download_url(archive_name, base_url=BACKEND_URL)
            
            message_text = (
                f"<b>📦 TData архив создан</b>\n\n"
                f"<b>Страна:</b> {country_code.upper()}\n"
                f"<b>Размер:</b> {file_size} МБ\n"
                f"<b>Файл:</b> <code>{archive_name}</code>\n\n"
                f"<a href='{download_url}'>📥 Скачать архив</a>\n\n"
                f"🗑️ <i>Папки будут удалены после выгрузки</i>"
            )
            
            # Delete archived folders
            TdataService.delete_archived_folders(country_code)
        # ... rest of code
```

#### Обновите `admin-bot/handlers/tdata.py` - часть для всех архивов

```python
@router.callback_query(F.data == TDATA_EXPORT_ALL)
async def tdata_export_all_handler(query: CallbackQuery):
    """Export all tdata files."""
    await query.answer("⏳ Создаю архив всех файлов...", show_alert=False)
    
    # Create archive
    result = TdataService.create_all_archive()
    
    if result:
        archive_path, archive_name = result
        archive_info = TdataService.get_archive_info(archive_path)
        
        if archive_info:
            file_size = archive_info['size_mb']
            # 👇 Передайте правильный base_url
            download_url = TdataService.get_download_url(archive_name, base_url=BACKEND_URL)
            
            message_text = (
                f"<b>📦 TData архив создан</b>\n\n"
                f"<b>Содержимое:</b> Все страны\n"
                f"<b>Размер:</b> {file_size} МБ\n"
                f"<b>Файл:</b> <code>{archive_name}</code>\n\n"
                f"<a href='{download_url}'>📥 Скачать архив</a>\n\n"
                f"🗑️ <i>Все папки будут удалены после выгрузки</i>"
            )
            
            # Delete all archived folders and cleanup old archives
            TdataService.delete_all_archived_folders()
            TdataService.cleanup_old_archives(keep_count=5)
        # ... rest of code
```

### 3️⃣ Способ B: Передать URL напрямую в конфиг бота

Если не хотите использовать `.env`, добавьте переменную в `admin-bot/bot.py`:

```python
# admin-bot/bot.py

# Настройка URL для скачивания архивов
BACKEND_URL = "http://localhost:3001"  # Измените на ваш URL
# Для VPS: BACKEND_URL = "https://yourdomain.com"

# ...

async def main():
    # ...
    # Передайте URL в контекст handlers
    from handlers import tdata
    tdata.BACKEND_URL = BACKEND_URL
    # ...
```

### 4️⃣ Способ C: Изменить прямо в методе get_download_url()

Отредактируйте `admin-bot/utils/tdata_service.py`:

```python
@classmethod
def get_download_url(cls, archive_name: str, base_url: str = "http://localhost:3001") -> str:
    """Generate download URL for archive.
    
    Args:
        archive_name: Name of archive file
        base_url: Base URL for downloads (adjust to your server)
    
    Returns:
        Full download URL
    """
    return f"{base_url}/archives/{archive_name}"
```

Измените `http://localhost:8000` на `http://localhost:3001` или ваш VPS URL.

---

## ✅ Проверка работы

### Локально:

```bash
# 1. Убедитесь, что backend запущен
cd backend
npm start
# Output должен показать: "Server is running on port 3001"

# 2. Проверьте, что архив создалась
ls -la admin-bot/archives/
# Должны быть файлы типа: tdata_ru_20251116_120000.zip

# 3. Попробуйте открыть ссылку в браузере
# http://localhost:3001/archives/tdata_ru_20251116_120000.zip
# Должно начаться скачивание
```

### На VPS (с nginx):

```bash
# 1. Если nginx настроен как reverse proxy:
# Убедитесь, что он проксирует /archives/ на backend

# Пример конфигурации nginx:
location /archives/ {
    proxy_pass http://localhost:3001/archives/;
    proxy_buffering off;
}

# 2. Тогда используйте в .env:
# BACKEND_URL=https://yourdomain.com

# 3. Или если архивы на отдельный путь:
location ~ ^/api/archives/(.*)$ {
    alias /home/user/gift-spin-wheel/admin-bot/archives/$1;
    try_files $uri =404;
}
```

---

## 🔧 Быстрый Чеклист

- [ ] Определить порт backend (обычно 3001)
- [ ] Создать/обновить `admin-bot/.env` с правильным `BACKEND_URL`
- [ ] Обновить `admin-bot/handlers/tdata.py` - добавить импорт `.env`
- [ ] Обновить оба вызова `TdataService.get_download_url()` - передать `base_url=BACKEND_URL`
- [ ] Перезапустить бота
- [ ] Протестировать создание архива и скачивание

---

## 📝 Готовый полный файл handlers/tdata.py

```python
"""Tdata export handlers for admin bot."""

from aiogram import Router, F
from aiogram.types import CallbackQuery
import os
from dotenv import load_dotenv

from utils.callbacks import (
    TDATA_EXPORT, TDATA_EXPORT_COUNTRY, TDATA_EXPORT_ALL,
    BACK_TO_MAIN
)
from utils.keyboards import tdata_export_keyboard, main_menu_keyboard
from utils.tdata_service import TdataService

# Загрузить переменные окружения
load_dotenv()
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')

router = Router()


@router.callback_query(F.data == TDATA_EXPORT)
async def tdata_export_handler(query: CallbackQuery):
    """Show tdata export menu."""
    available = TdataService.get_available_countries()
    
    if not available:
        message_text = (
            "<b>📦 Экспорт TData</b>\n\n"
            "❌ Нет доступных tdata файлов для экспорта"
        )
    else:
        countries_list = "\n".join([f"• {code.upper()}: {count} папок" for code, count in available.items()])
        message_text = (
            "<b>📦 Экспорт TData</b>\n\n"
            "Доступные страны:\n"
            f"{countries_list}\n\n"
            "Выберите страну или экспортируйте всё сразу:"
        )
    
    await query.answer()
    
    await query.message.edit_text(
        message_text,
        reply_markup=tdata_export_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data.startswith(TDATA_EXPORT_COUNTRY))
async def tdata_export_country_handler(query: CallbackQuery):
    """Export tdata for specific country."""
    country_code = query.data.replace(TDATA_EXPORT_COUNTRY, "")
    
    await query.answer("⏳ Создаю архив...", show_alert=False)
    
    # Create archive
    result = TdataService.create_archive(country_code)
    
    if result:
        archive_path, archive_name = result
        archive_info = TdataService.get_archive_info(archive_path)
        
        if archive_info:
            file_size = archive_info['size_mb']
            download_url = TdataService.get_download_url(archive_name, base_url=BACKEND_URL)
            
            message_text = (
                f"<b>📦 TData архив создан</b>\n\n"
                f"<b>Страна:</b> {country_code.upper()}\n"
                f"<b>Размер:</b> {file_size} МБ\n"
                f"<b>Файл:</b> <code>{archive_name}</code>\n\n"
                f"<a href='{download_url}'>📥 Скачать архив</a>\n\n"
                f"🗑️ <i>Папки будут удалены после выгрузки</i>"
            )
            
            # Delete archived folders
            TdataService.delete_archived_folders(country_code)
        else:
            message_text = (
                "<b>❌ Ошибка</b>\n\n"
                "Не удалось получить информацию об архиве"
            )
    else:
        message_text = (
            "<b>❌ Ошибка</b>\n\n"
            f"Не удалось создать архив для страны {country_code.upper()}"
        )
    
    await query.message.edit_text(
        message_text,
        reply_markup=tdata_export_keyboard(),
        parse_mode="HTML",
        disable_web_page_preview=False
    )


@router.callback_query(F.data == TDATA_EXPORT_ALL)
async def tdata_export_all_handler(query: CallbackQuery):
    """Export all tdata files."""
    await query.answer("⏳ Создаю архив всех файлов...", show_alert=False)
    
    # Create archive
    result = TdataService.create_all_archive()
    
    if result:
        archive_path, archive_name = result
        archive_info = TdataService.get_archive_info(archive_path)
        
        if archive_info:
            file_size = archive_info['size_mb']
            download_url = TdataService.get_download_url(archive_name, base_url=BACKEND_URL)
            
            message_text = (
                f"<b>📦 TData архив создан</b>\n\n"
                f"<b>Содержимое:</b> Все страны\n"
                f"<b>Размер:</b> {file_size} МБ\n"
                f"<b>Файл:</b> <code>{archive_name}</code>\n\n"
                f"<a href='{download_url}'>📥 Скачать архив</a>\n\n"
                f"🗑️ <i>Все папки будут удалены после выгрузки</i>"
            )
            
            # Delete all archived folders and cleanup old archives
            TdataService.delete_all_archived_folders()
            TdataService.cleanup_old_archives(keep_count=5)
        else:
            message_text = (
                "<b>❌ Ошибка</b>\n\n"
                "Не удалось получить информацию об архиве"
            )
    else:
        message_text = (
            "<b>❌ Ошибка</b>\n\n"
            "Не удалось создать архив со всеми файлами"
        )
    
    await query.message.edit_text(
        message_text,
        reply_markup=tdata_export_keyboard(),
        parse_mode="HTML",
        disable_web_page_preview=False
    )


@router.callback_query(F.data == BACK_TO_MAIN)
async def back_to_main_handler(query: CallbackQuery):
    """Go back to main menu."""
    await query.answer()
    
    message_text = (
        "<b>🎡 Gift Spin Wheel Admin Bot</b>\n\n"
        "Главное меню"
    )
    
    await query.message.edit_text(
        message_text,
        reply_markup=main_menu_keyboard(),
        parse_mode="HTML"
    )
```

---

## 🚀 Итоговые шаги

### Шаг 1: Создать `.env` файл

```bash
cd admin-bot
cat > .env << 'EOF'
BACKEND_URL=http://localhost:3001
EOF
```

### Шаг 2: Обновить handlers/tdata.py

Замените содержимое файла на готовый код выше.

### Шаг 3: Убедиться, что backend работает

```bash
cd backend
npm start
# Output: Server is running on port 3001
```

### Шаг 4: Перезапустить бота

```bash
cd admin-bot
python3 bot.py
```

### Шаг 5: Протестировать

1. Откройте меню бота
2. Нажмите "📦 Экспорт TData"
3. Выберите страну
4. Кликните на ссылку "📥 Скачать архив"
5. Файл должен скачаться ✅

---

## 🔍 Диагностика проблем

Если ссылка по-прежнему не работает:

```bash
# 1. Проверить, работает ли backend
curl http://localhost:3001/archives/
# Должен вернуть список файлов или 200 OK

# 2. Проверить, существует ли архив
ls -la admin-bot/archives/
# Должны быть .zip файлы

# 3. Проверить путь к архивам в server.js
grep "app.use.*archives" backend/server.js
# Должна быть строка: app.use('/archives', express.static(archivesPath));

# 4. Посмотреть логи бота
# Проверьте, выводит ли бот правильный URL в сообщение
```

---

## 📱 Для VPS с nginx

Если вы используете nginx как reverse proxy:

```nginx
# /etc/nginx/sites-available/yourdomain.conf

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL config...
    
    # Статические файлы фронтенда
    location / {
        root /home/user/gift-spin-wheel/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Архивы TData
    location /archives/ {
        proxy_pass http://localhost:3001/archives/;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

Тогда в `.env`:

```bash
BACKEND_URL=https://yourdomain.com
```

---

Готово! Теперь ссылка должна работать. ✅
