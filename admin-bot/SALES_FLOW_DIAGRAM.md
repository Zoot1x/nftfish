# Sales System Flow Diagram

## Menu Navigation

```
┌─────────────────────────────┐
│     ГЛАВНОЕ МЕНЮ            │
│  📊 Статистика логов        │
│  💰 Продажа                 │
└──────────────┬──────────────┘
               │
               ↓
      ┌────────────────┐
      │ 💰 ПРОДАЖА     │
      │                │
      │ 🟢/🔴 Автопродажа
      │ 🌍 Продать по странам
      │ « Назад        │
      └───┬────────┬───┘
          │        │
    ┌─────┘        └─────┐
    ↓                     ↓
┌──────────────┐  ┌─────────────────────────┐
│ АВТОПРОДАЖА  │  │ ПРОДАТЬ ПО СТРАНАМ      │
│              │  │                         │
│ 🟢 Включена  │  │ 🇷🇺 Russia             │
│ 🔴 Отключена │  │ 🇺🇸 United States      │
│              │  │ 🇬🇧 United Kingdom     │
│ Состояние    │  │ ... (36 countries)      │
│ сохранено    │  │ « Назад                 │
│              │  └────────────┬────────────┘
└──────────────┘               │
      ↑ Back to Menu           │ Select Country
      └───────────┬────────────┘
                  │
                  ↓
      ┌──────────────────────┐
      │ ПОДТВЕРЖДЕНИЕ        │
      │                      │
      │ Вы хотите продать    │
      │ для Russia? 🇷🇺      │
      │                      │
      │ ✅ Продать           │
      │ ❌ Отменить          │
      └────┬─────────────┬───┘
           │ Execute     │ Cancel
      ┌────┘             └─┐
      ↓                    ↓
  ┌─────────┐      ┌──────────────┐
  │ УСПЕХ   │      │ ОТМЕНА       │
  │         │      │              │
  │ ✅ Продано    │ « Назад       │
  │ записано│      │              │
  └────┬────┘      └────┬─────────┘
       │                │
       └────────┬───────┘
              Return to Sales Menu
```

## Auto-Sales Toggle Flow

```
USER ACTION: Click "Автопродажа"
       ↓
CHECK CURRENT STATE
       ↓
   ┌───┴───┐
   ↓       ↓
ENABLED DISABLED
   │       │
   ├───┬───┤
   ↓   ↓
 OFF   ON  ← New State
   ↓   ↓
🔴  🟢   ← Button Color
   │   │
   └───┴─→ SAVE to sales_state.json
           ↓
       SHOW ALERT
       "Автопродажа 🟢 включена"
       or
       "Автопродажа 🔴 отключена"
           ↓
       UPDATE MENU DISPLAY
       ↓
    RETURN TO MENU
```

## Manual Sales Flow

```
USER ACTION: Click "🌍 Продать по странам"
       ↓
DISPLAY COUNTRY LIST
(36 countries with flags from COUNTRY_FLAGS)
       ↓
USER SELECTS COUNTRY
(e.g., 🇷🇺 Russia)
       ↓
PARSE CALLBACK DATA
callback_data = "sales_select_country:Russia"
       ↓
EXTRACT COUNTRY NAME
country = "Russia"
       ↓
GET COUNTRY FLAG
flag = COUNTRY_FLAGS["Russia"]  # 🇷🇺
       ↓
SHOW CONFIRMATION
┌─────────────────────────┐
│ 🇷🇺 Подтверждение      │
│                         │
│ Вы хотите продать       │
│ для Russia?             │
│                         │
│ ✅ Продать  ❌ Отменить │
└───────┬────────────┬────┘
        │ YES        │ NO
        ↓            ↓
    EXECUTE          BACK
    ↓               ↓
CREATE SALE       CANCEL
RECORD            ↓
{                SHOW
  timestamp,    COUNTRIES
  country,      MENU
  amount,
  status
}
↓
SAVE TO
sales_state.json
↓
SHOW SUCCESS
"✅ Продажа выполнена"
↓
RETURN TO SALES MENU
```

## Data Persistence

```
MEMORY                      DISK
                       (sales_state.json)
┌──────────────┐
│ SalesService │
└────┬─────────┘
     │
     ├─ toggle_auto_sales()
     │  └─→ writes to JSON
     │
     ├─ record_sale()
     │  └─→ appends to JSON
     │
     └─ get_sales_summary()
        └─→ reads from JSON

Directory Structure:
admin-bot/
├── data/
│   └── sales_state.json ← PERSISTED HERE
├── handlers/
│   └── sales.py
├── utils/
│   ├── sales_service.py
│   └── keyboards.py
└── bot.py
```

## State File Format

```json
{
  "auto_sales_enabled": false,
  "sales_log": [
    {
      "timestamp": "2025-11-16T12:34:56.789123",
      "country": "Russia",
      "amount": 1.0,
      "status": "completed"
    },
    {
      "timestamp": "2025-11-16T12:35:10.123456",
      "country": "United States",
      "amount": 1.0,
      "status": "completed"
    }
  ]
}
```

## Callback Data Structure

```
CALLBACK DATA PATTERNS:

1. Main Actions:
   - "sales"                          → Open sales menu
   - "sales_auto"                     → Toggle auto-sales
   - "sales_by_country"               → Show country list

2. Country Selection:
   - "sales_select_country:Russia"
   - "sales_select_country:Ukraine"
   - etc. (36 countries)

3. Confirmation:
   - "sales_confirm:Russia"           (confirmation page)
   - "sales_execute:Russia"           (execute sale)

4. Navigation:
   - "back_to_sales"                  → Return to sales menu
   - "back_to_sales_country"          → Return to country list
   - "back_to_main"                   → Return to main menu
```

## Integration Points

```
bot.py
  │
  ├─ dp.include_router(start.router)
  ├─ dp.include_router(stats.router)
  └─ dp.include_router(sales.router)  ← NEW
         │
         └─ handlers/sales.py
            ├─ sales_handler()
            ├─ sales_auto_handler()
            ├─ sales_by_country_handler()
            ├─ sales_select_country_handler()
            ├─ sales_execute_handler()
            ├─ back_to_sales_handler()
            └─ back_to_sales_country_handler()
```

## Handler Interaction with Services

```
handlers/sales.py           utils/sales_service.py      utils/log_service.py
     │                            │                           │
     ├─ sales_auto_handler() ────→ toggle_auto_sales()       │
     │                            └─ _load_state()            │
     │                            └─ _save_state()            │
     │                                                        │
     ├─ sales_select_country_handler() ──────────────────→ COUNTRY_FLAGS
     │                                                        │
     ├─ sales_execute_handler() ──→ record_sale()            │
     │                            └─ _load_state()            │
     │                            └─ _save_state()            │
     │                                                        │
     └─ All handlers ────────────→ sales_countries_keyboard()
                                  └─ uses COUNTRY_FLAGS
```
