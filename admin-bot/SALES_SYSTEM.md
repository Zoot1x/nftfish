# Sales System Documentation

## Overview

The admin bot now includes a comprehensive sales management system with two main modes:

### 1. Auto-Sales (Автопродажа)
- **Status**: Toggle between enabled (🟢) and disabled (🔴)
- **Functionality**: When enabled, automatically handles sales operations
- **Visual Indicator**: Button color changes to show current state
- **Storage**: State persisted in `data/sales_state.json`

### 2. Manual Sales by Country (Продать по странам)
- **Step 1**: Select country from 36 available countries with flags
- **Step 2**: Confirmation screen showing selected country and flag
- **Step 3**: Execute sale or cancel and return to country selection

## File Structure

```
admin-bot/
├── handlers/
│   └── sales.py              # Sales callback handlers
├── utils/
│   ├── callbacks.py          # Callback constants for sales
│   ├── keyboards.py          # Keyboard definitions for sales UI
│   ├── sales_service.py      # Business logic for sales operations
│   └── log_service.py        # Country flags and names reference
├── data/
│   └── sales_state.json      # Persisted sales state
└── bot.py                    # Main bot with sales router included
```

## Key Components

### SalesService (utils/sales_service.py)

**Main Methods:**

```python
SalesService.is_auto_sales_enabled() -> bool
    # Check if auto-sales is currently enabled

SalesService.toggle_auto_sales() -> bool
    # Toggle auto-sales on/off, returns new state

SalesService.record_sale(country: str, amount: float) -> bool
    # Record a sale transaction
    # Args: country name, amount sold
    # Returns: True if recorded successfully

SalesService.get_sales_summary() -> dict
    # Get complete sales summary with breakdown by country
    # Returns: {
    #   'total_sales': int,
    #   'total_amount': float,
    #   'auto_sales_enabled': bool,
    #   'by_country': {country: {'count': int, 'amount': float}}
    # }
```

**State Persistence:**
- State stored in JSON format: `data/sales_state.json`
- Auto-creates directory and file on first use
- Handles read/write errors gracefully

### Sales Handlers (handlers/sales.py)

**Handlers:**

1. `sales_handler()` - Main sales menu
2. `sales_auto_handler()` - Toggle auto-sales with visual feedback
3. `sales_by_country_handler()` - Show country list
4. `sales_select_country_handler()` - Show confirmation for selected country
5. `sales_execute_handler()` - Execute the sale and record it
6. `back_to_sales_handler()` - Return to main sales menu
7. `back_to_sales_country_handler()` - Return to country selection

### Keyboards (utils/keyboards.py)

**Sales Keyboards:**

```python
sales_menu_keyboard()
    # Main sales menu with auto-sales toggle and by-country option
    # Auto-sales button changes color: 🟢 (enabled) / 🔴 (disabled)

sales_countries_keyboard()
    # 36-country selection with flags
    # Dynamic based on LogService.COUNTRY_FLAGS

sales_confirm_keyboard(country: str)
    # Confirmation with ✅ Продать and ❌ Отменить buttons
```

## User Flow

### Auto-Sales Toggle

```
Main Menu
    ↓
💰 Продажа
    ↓
🟢/🔴 Автопродажа (Click to toggle)
    ↓
Updated status shown with visual feedback
    ↓
Button state persisted to disk
```

### Manual Sales by Country

```
Main Menu
    ↓
💰 Продажа
    ↓
🌍 Продать по странам
    ↓
Country Selection (36 countries with flags)
    ↓
🇷🇺 Russia (example - shows flag + name)
    ↓
Confirmation: "Вы хотите продать для Russia?"
    ✅ Продать  or  ❌ Отменить
    ↓
Sale Recorded & Summary Shown
    ↓
Return to Sales Menu
```

## Country Support

The system supports 36 countries:

- 🇷🇺 Russia
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇩🇪 Germany
- 🇫🇷 France
- 🇮🇹 Italy
- 🇪🇸 Spain
- 🇵🇱 Poland
- 🇹🇷 Turkey
- 🇮🇳 India
- 🇨🇳 China
- 🇯🇵 Japan
- 🇰🇷 South Korea
- 🇧🇷 Brazil
- 🇲🇽 Mexico
- 🇦🇷 Argentina
- 🇨🇦 Canada
- 🇦🇺 Australia
- 🇳🇿 New Zealand
- 🇮🇩 Indonesia
- 🇹🇭 Thailand
- 🇻🇳 Vietnam
- 🇵🇭 Philippines
- 🇲🇾 Malaysia
- 🇵🇰 Pakistan
- 🇧🇩 Bangladesh
- 🇳🇬 Nigeria
- 🇰🇪 Kenya
- 🇿🇦 South Africa
- 🇪🇬 Egypt
- 🇬🇷 Greece
- 🇳🇱 Netherlands
- 🇧🇪 Belgium
- 🇨🇭 Switzerland
- 🇸🇪 Sweden
- 🇩🇰 Denmark

## Testing

Test file: `test_sales.py` (generated from terminal)

```bash
cd admin-bot
python3 -c "
from utils.sales_service import SalesService
# Test auto-sales toggle
print(SalesService.is_auto_sales_enabled())
SalesService.toggle_auto_sales()
# Test recording sales
SalesService.record_sale('Russia', 1.0)
# Get summary
print(SalesService.get_sales_summary())
"
```

## Integration with Main Bot

The sales router is automatically included in `bot.py`:

```python
from handlers import start, stats, sales
# ...
dp.include_router(sales.router)
```

## Data Schema (sales_state.json)

```json
{
  "auto_sales_enabled": false,
  "sales_log": [
    {
      "timestamp": "2025-11-16T12:34:56.789123",
      "country": "Russia",
      "amount": 1.0,
      "status": "completed"
    }
  ]
}
```

## Error Handling

- **File I/O Errors**: Caught and logged, returns sensible defaults
- **Invalid Country**: User only sees valid countries from COUNTRY_FLAGS
- **Sale Recording**: Returns boolean for success/failure
- **State Toggle**: Always succeeds, state persisted immediately

## Future Enhancements

Possible additions:
- Automatic sales reporting/statistics view
- Sales by time period analytics
- Bulk sales operations
- Sales history with filtering
- Notifications for sales transactions
- Integration with actual payment system
