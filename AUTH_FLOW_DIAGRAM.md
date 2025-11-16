# Диаграмма потока авторизации Telegram

## Полный процесс авторизации

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIFT SPIN WHEEL - AUTH FLOW                  │
└─────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════╗
║                      ШАГИ АВТОРИЗАЦИИ                           ║
╚════════════════════════════════════════════════════════════════╝

┌─ STEP 1: PHONE INPUT ─────────────────────────────────────────┐
│                                                                  │
│  User:  Вводит номер                                           │
│         +79991234567                                           │
│                 ↓                                               │
│         [Отправить код]                                        │
│                 ↓                                               │
│  Frontend: POST /api/auth/send-code                            │
│            { phone: "+79991234567" }                           │
│                 ↓                                               │
│  Backend:  spawn python auth.py send_code "+79991234567"      │
│                 ↓                                               │
│  Python:   TelegramClient.send_code_request(phone)            │
│                 ↓                                               │
│  Telegram: Отправляет код 12345 в приложение User            │
│                 ↓                                               │
│  Response: { success: true,                                    │
│              phone_code_hash: "xxx123xxx" }                    │
│                 ↓                                               │
│  Frontend: Переход на STEP 2                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────┘

┌─ STEP 2: CODE INPUT ──────────────────────────────────────────┐
│                                                                  │
│  User:  Открывает Telegram                                    │
│         Видит сообщение: "Код: 12345"                         │
│         Вводит в приложение: 12345                            │
│                 ↓                                               │
│         [Подтвердить]                                          │
│                 ↓                                               │
│  Frontend: POST /api/auth/verify-code                          │
│            { phone: "+79991234567",                            │
│              code: "12345",                                    │
│              phone_code_hash: "xxx123xxx" }                    │
│                 ↓                                               │
│  Backend:  spawn python auth.py verify_code ...              │
│                 ↓                                               │
│  Python:   TelegramClient.sign_in(code=12345)                │
│            ├─ SUCCESS → Возврат user_id, username            │
│            └─ ERROR: SessionPasswordNeededError                │
│                ↓ (если 2FA включена)                           │
│             Возврат: { error: "password_needed" }             │
│                 ↓                                               │
│  Frontend: Проверка ответа                                    │
│            ├─ Успех → STEP 4 (success screen)                 │
│            └─ password_needed → STEP 3 (password)              │
│                                                                  │
└──────────────────────────────────────────────────────────────┘

┌─ STEP 3: PASSWORD INPUT (2FA) ────────────────────────────────┐
│  [Только если включена 2FA]                                   │
│                                                                  │
│  User:  Вводит пароль 2FA                                     │
│         ••••••••                                               │
│                 ↓                                               │
│         [Подтвердить]                                          │
│                 ↓                                               │
│  Frontend: POST /api/auth/verify-password                      │
│            { phone: "+79991234567",                            │
│              password: "my2fapass",                            │
│              phone_code_hash: "xxx123xxx",                    │
│              code: "12345" }                                   │
│                 ↓                                               │
│  Backend:  spawn python auth.py verify_password ...           │
│                 ↓                                               │
│  Python:   TelegramClient.sign_in(password="my2fapass")      │
│                 ↓                                               │
│  Response: { success: true,                                    │
│              id: 123456789,                                    │
│              first_name: "John" }                             │
│                 ↓                                               │
│  Frontend: Переход на STEP 4 (success screen)                 │
│                                                                  │
└──────────────────────────────────────────────────────────────┘

┌─ STEP 4: SUCCESS SCREEN ──────────────────────────────────────┐
│                                                                  │
│            ✅ Успешно!                                         │
│            Привет, John!                                       │
│                                                                  │
│  Через 1.5 секунды:                                           │
│  - Модальное окно закрывается                                  │
│  - Вызывается onLogin() callback                              │
│  - User data сохраняется в localStorage                       │
│                                                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Архитектура системы

```
┌────────────────────────────────────────────────────────────────┐
│                      WEB BROWSER                                │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           React App (localhost:5173)                    │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ LoginModal Component                               │ │  │
│  │  │                                                    │ │  │
│  │  │ State Machine:                                     │ │  │
│  │  │ - phone (input field)                             │ │  │
│  │  │ - code (5 digits)                                 │ │  │
│  │  │ - password (for 2FA)                              │ │  │
│  │  │ - success (thank you screen)                      │ │  │
│  │  │                                                    │ │  │
│  │  │ Functions:                                         │ │  │
│  │  │ - handleSendCode()      → POST /auth/send-code    │ │  │
│  │  │ - handleVerifyCode()    → POST /auth/verify-code  │ │  │
│  │  │ - handleVerifyPassword()→ POST /auth/verify-pass  │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  API_URL = import.meta.env.VITE_API_URL                │  │
│  │          = http://localhost:3001                        │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓ fetch()                          │
└────────────────────────────────────────────────────────────────┘
                               ↓
                        HTTP JSON Request
                               ↓
┌────────────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER                                │
│              (localhost:3001)                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ server.js                                                │  │
│  │                                                          │  │
│  │ Routes:                                                  │  │
│  │ ┌─ POST /api/auth/send-code                            │  │
│  │ │   ├─ Extract phone from request                      │  │
│  │ │   ├─ spawn: python3 auth.py send_code phone         │  │
│  │ │   └─ Return JSON response                            │  │
│  │ │                                                       │  │
│  │ ├─ POST /api/auth/verify-code                         │  │
│  │ │   ├─ Extract phone, code, hash from request         │  │
│  │ │   ├─ spawn: python3 auth.py verify_code ...         │  │
│  │ │   └─ Return JSON response                            │  │
│  │ │                                                       │  │
│  │ └─ POST /api/auth/verify-password                     │  │
│  │     ├─ Extract phone, password, hash, code from req   │  │
│  │     ├─ spawn: python3 auth.py verify_password ...     │  │
│  │     └─ Return JSON response                            │  │
│  │                                                          │  │
│  │ child_process.spawn() → Python sub-process             │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓ spawn()                          │
└────────────────────────────────────────────────────────────────┘
                               ↓
                    Python subprocess
                               ↓
┌────────────────────────────────────────────────────────────────┐
│                     PYTHON (Telethon)                           │
│                      (auth.py)                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Functions (async):                                       │  │
│  │                                                          │  │
│  │ send_code(phone)                                         │  │
│  │ ├─ TelegramClient(session_name=phone)                  │  │
│  │ ├─ client.connect()                                    │  │
│  │ ├─ phone_code_hash = client.send_code_request(phone)  │  │
│  │ ├─ return { phone_code_hash }                          │  │
│  │ └─ Session saved → sessions/phone.session              │  │
│  │                                                          │  │
│  │ verify_code(phone, code, phone_code_hash)              │  │
│  │ ├─ Load session from sessions/phone.session            │  │
│  │ ├─ client.sign_in(phone, code, phone_code_hash)       │  │
│  │ ├─ Extract user_id, first_name, username              │  │
│  │ ├─ return { success, user_id, first_name, username }  │  │
│  │ └─ On SessionPasswordNeededError:                      │  │
│  │     return { error: "password_needed" }                │  │
│  │                                                          │  │
│  │ verify_password(phone, password, ...)                  │  │
│  │ ├─ Load session from sessions/phone.session            │  │
│  │ ├─ client.sign_in(password=password)                  │  │
│  │ ├─ Extract user_id, first_name                         │  │
│  │ └─ return { success, user_id, first_name }             │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓ TelegramClient API calls         │
└────────────────────────────────────────────────────────────────┘
                               ↓
                    HTTP requests to Telegram
                               ↓
┌────────────────────────────────────────────────────────────────┐
│                  TELEGRAM SERVERS                               │
│              (api.telegram.org)                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Telegram Bot API / Telegram Client API                  │  │
│  │                                                          │  │
│  │ Actions:                                                 │  │
│  │ - Sends auth code to user's device                     │  │
│  │ - Receives and verifies code                            │  │
│  │ - Verifies 2FA password if needed                       │  │
│  │ - Returns user information                              │  │
│  │                                                          │  │
│  │ Requires: TELEGRAM_API_ID, TELEGRAM_API_HASH           │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Файл хранения сессий

```
backend/sessions/
├── +79991234567.session      ← Сессия для первого пользователя
├── +79876543210.session      ← Сессия для второго пользователя
└── +1-555-0123.session       ← Сессия для третьего пользователя

Содержимое: Encrypted session data (binary)
Назначение: Telethon использует для восстановления session
Время жизни: До истечения сессии Telegram (~180 дней)
Безопасность: Не коммитится в git (.gitignore)
```

---

## Ошибки и их обработка

```
┌─ send_code ─────────────────────────────────────────────┐
│                                                          │
│ Возможные ошибки:                                        │
│ - ConnectionError → "Нет интернета"                     │
│ - ValueError → "Неверный формат номера"                │
│ - Exception → "Ошибка при отправке кода"               │
│                                                          │
│ Ответ на ошибку:                                        │
│ { error: "error_message" }                             │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─ verify_code ────────────────────────────────────────────┐
│                                                          │
│ Возможные ошибки:                                        │
│ - SessionPasswordNeededError                            │
│   → { error: "password_needed" }                        │
│   → Frontend переходит на STEP 3                        │
│                                                          │
│ - InvalidCodeError                                      │
│   → { error: "Неверный код" }                          │
│                                                          │
│ - Exception                                             │
│   → { error: "Ошибка верификации" }                     │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─ verify_password ────────────────────────────────────────┐
│                                                          │
│ Возможные ошибки:                                        │
│ - InvalidPasswordError                                  │
│   → { error: "Неверный пароль" }                       │
│                                                          │
│ - Exception                                             │
│   → { error: "Ошибка верификации" }                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Примеры запросов/ответов

### Step 1: Send Code

**Request**:
```json
POST http://localhost:3001/api/auth/send-code
Content-Type: application/json

{
  "phone": "+79991234567"
}
```

**Response** (Success):
```json
{
  "success": true,
  "phone_code_hash": "abc123def456ghi789"
}
```

**Response** (Error):
```json
{
  "error": "Invalid phone number format"
}
```

---

### Step 2: Verify Code

**Request**:
```json
POST http://localhost:3001/api/auth/verify-code
Content-Type: application/json

{
  "phone": "+79991234567",
  "code": "12345",
  "phone_code_hash": "abc123def456ghi789"
}
```

**Response** (Success):
```json
{
  "success": true,
  "id": 123456789,
  "first_name": "John",
  "username": "john_doe"
}
```

**Response** (2FA Required):
```json
{
  "error": "password_needed"
}
```

**Response** (Wrong Code):
```json
{
  "error": "Неверный код"
}
```

---

### Step 3: Verify Password

**Request**:
```json
POST http://localhost:3001/api/auth/verify-password
Content-Type: application/json

{
  "phone": "+79991234567",
  "password": "my_2fa_password",
  "phone_code_hash": "abc123def456ghi789",
  "code": "12345"
}
```

**Response** (Success):
```json
{
  "success": true,
  "id": 123456789,
  "first_name": "John"
}
```

**Response** (Wrong Password):
```json
{
  "error": "Неверный пароль"
}
```

---

## Переменные окружения

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef
PORT=3001
```

---

## Временные параметры

| Параметр | Значение | Назначение |
|----------|----------|-----------|
| Code timeout | ~5 минут | Telegram удаляет неиспользованный код |
| Session lifetime | ~180 дней | Сессия Telegram активна 6 месяцев |
| Modal close delay | 1.5 сек | Показать успех перед закрытием |
| Password attempts | 3-5 | Попытки ввода 2FA пароля |

---

## Безопасность

- ✅ **API credentials в .env** - не коммитятся в git
- ✅ **Sessions в sessions/** - не коммитятся в git
- ✅ **HTTPS в production** - обязательно
- ✅ **CORS configured** - только доверенные домены
- ✅ **No password logging** - пароли не логируются
- ✅ **Rate limiting** - рекомендуется в production

---

*Диаграмма создана для помощи в понимании flow Telegram авторизации*
