import os
import logging
import shutil
import json
import urllib.request
from pathlib import Path
from telethon import TelegramClient
from dotenv import load_dotenv
import sys


# basic logging setup
log_dir_base = 'results/session_to_tdata'
os.makedirs(log_dir_base, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(log_dir_base, 'converter.log'),
    filemode='a',
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO,
)


# load env for bot credentials (optional)
load_dotenv()
BOT_TOKEN = os.getenv('NOTIFY_BOT_TOKEN')
BOT_CHAT_ID = os.getenv('NOTIFY_BOT_CHAT_ID')

# Резервные боты для отправки уведомлений
BOT_TOKENS_BACKUP = [
    os.getenv('NOTIFY_BOT_TOKEN_2'),
    os.getenv('NOTIFY_BOT_TOKEN_3'),
    os.getenv('NOTIFY_BOT_TOKEN_4'),
]
BOT_CHAT_IDS_BACKUP = [
    os.getenv('NOTIFY_BOT_CHAT_ID_2'),
    os.getenv('NOTIFY_BOT_CHAT_ID_3'),
    os.getenv('NOTIFY_BOT_CHAT_ID_4'),
]

# Маппинг кодов стран на флаги и названия
COUNTRY_FLAGS = {
    'us': ('🇺🇸', 'USA'),
    'ru': ('🇷🇺', 'Russia'),
    'uk': ('🇬🇧', 'UK'),
    'fr': ('🇫🇷', 'France'),
    'de': ('🇩🇪', 'Germany'),
    'it': ('🇮🇹', 'Italy'),
    'es': ('🇪🇸', 'Spain'),
    'nl': ('🇳🇱', 'Netherlands'),
    'be': ('🇧🇪', 'Belgium'),
    'at': ('🇦🇹', 'Austria'),
    'ch': ('🇨🇭', 'Switzerland'),
    'se': ('🇸🇪', 'Sweden'),
    'dk': ('🇩🇰', 'Denmark'),
    'no': ('🇳🇴', 'Norway'),
    'fi': ('🇫🇮', 'Finland'),
    'pl': ('🇵🇱', 'Poland'),
    'gr': ('🇬🇷', 'Greece'),
    'tr': ('🇹🇷', 'Turkey'),
    'cn': ('🇨🇳', 'China'),
    'jp': ('🇯🇵', 'Japan'),
    'kr': ('🇰🇷', 'South Korea'),
    'in': ('🇮🇳', 'India'),
    'sg': ('🇸🇬', 'Singapore'),
    'my': ('🇲🇾', 'Malaysia'),
    'id': ('🇮🇩', 'Indonesia'),
    'th': ('🇹🇭', 'Thailand'),
    'vn': ('🇻🇳', 'Vietnam'),
    'au': ('🇦🇺', 'Australia'),
    'nz': ('🇳🇿', 'New Zealand'),
    'za': ('🇿🇦', 'South Africa'),
    'ng': ('🇳🇬', 'Nigeria'),
    'eg': ('🇪🇬', 'Egypt'),
    'br': ('🇧🇷', 'Brazil'),
    'mx': ('🇲🇽', 'Mexico'),
    'ar': ('🇦🇷', 'Argentina'),
    'cl': ('🇨🇱', 'Chile'),
    'co': ('🇨🇴', 'Colombia'),
    'unknown': ('❓', 'Unknown'),
}


def send_telegram_notification(text: str, country_code: str = None) -> bool:
    """Отправляет текст в Telegram-чат через Bot API с поддержкой резервных ботов.
    
    Пытается отправить сначала основным ботом, потом резервными.
    Возвращает True если хотя бы один бот успешно отправил сообщение.
    """
    # Список ботов для попытки (основной + резервные)
    bot_credentials = []
    
    if BOT_TOKEN and BOT_CHAT_ID:
        bot_credentials.append((BOT_TOKEN, BOT_CHAT_ID, 'primary'))
    
    for i, (token, chat_id) in enumerate(zip(BOT_TOKENS_BACKUP, BOT_CHAT_IDS_BACKUP)):
        if token and chat_id:
            bot_credentials.append((token, chat_id, f'backup_{i+1}'))
    
    if not bot_credentials:
        logging.info("No bot credentials configured; skipping notification")
        return False
    
    success_count = 0
    
    for bot_token, chat_id, bot_type in bot_credentials:
        try:
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            payload = json.dumps({
                'chat_id': chat_id,
                'text': text,
                'parse_mode': 'HTML'
            }).encode('utf-8')

            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = resp.read().decode('utf-8')
                logging.info(f"Notification sent via {bot_type}: {resp_data}")
                success_count += 1
        except Exception as e:
            logging.warning(f"Failed to send notification via {bot_type}: {e}")
            continue
    
    return success_count > 0


def get_country_flag_and_name(country_code: str) -> tuple:
    """Получить флаг и название страны по коду.
    
    Returns:
        tuple: (flag, country_name) например ('🇷🇺', 'Russia')
    """
    return COUNTRY_FLAGS.get(country_code, COUNTRY_FLAGS['unknown'])


def copy_tdata_to_bot(tdata_path: str, country_code: str = None) -> bool:
    """Копирует tdata папку в admin-bot/tdatas/COUNTRY_CODE/ папку.
    
    Args:
        tdata_path: путь к папке tdata
        country_code: двухбуквенный код страны (например "ru", "us")
    
    Returns:
        bool: True если успешно скопировано, False если ошибка
    """
    try:
        tdata_source = Path(tdata_path)
        if not tdata_source.exists():
            logging.warning(f"Папка tdata не найдена: {tdata_path}")
            return False
        
        # Получаем parent directory (это будет папка с номером телефона)
        phone_folder = tdata_source.parent.name  # например "9123456789"
        
        # Определяем country_code если не передан
        if not country_code:
            country_code = 'unknown'
        
        # Путь для копирования: admin-bot/tdatas/COUNTRY_CODE/PHONE_NUMBER
        bot_tdatas_dir = Path(__file__).parent.parent / 'admin-bot' / 'tdatas' / country_code
        bot_account_dir = bot_tdatas_dir / phone_folder
        
        # Создаем директории если их нет
        bot_account_dir.mkdir(parents=True, exist_ok=True)
        
        # Копируем содержимое папки tdata в bot_account_dir
        for item in tdata_source.iterdir():
            if item.is_file():
                shutil.copy2(item, bot_account_dir / item.name)
            elif item.is_dir():
                dest_dir = bot_account_dir / item.name
                if dest_dir.exists():
                    shutil.rmtree(dest_dir)
                shutil.copytree(item, dest_dir)
        
        logging.info(f"✅ TData скопирован в bot: {bot_account_dir}")
        return True
    
    except Exception as e:
        logging.error(f"❌ Ошибка при копировании tdata в bot: {e}")
        return False


async def convert_session_to_tdata(phone_num: str, session_path: str, api_id: int, api_hash: str, output_dir=None, country_code: str = None):
    """Конвертация конкретной сессии в tdata.

    Возвращает путь к сгенерированной папке tdata при успехе,
    или False при неудаче.
    
    Args:
        phone_num: номер телефона (без кода страны, например "9123456789")
        session_path: путь к файлу сессии
        api_id: API ID Telegram
        api_hash: API HASH Telegram
        output_dir: директория для сохранения tdata (опционально)
        country_code: двухбуквенный код страны (например "ru", "us") для уведомлений
    """
    session_file = Path(session_path)
    if not session_file.exists():
        logging.warning(f"Файл сессии {session_file} не найден")
        return False

    # Определим куда сохранять tdata.
    if output_dir:
        tdata_path = Path(output_dir) / phone_num / 'tdata'
    else:
        os.makedirs('results/session_to_tdata/tdatas', exist_ok=True)
        tdata_path = Path('results/session_to_tdata/tdatas') / phone_num / 'tdata'

    client = None
    try:
        logging.info(f"Начинаю конвертацию: {session_file} -> {tdata_path}")

        # Уведомление о появлении новой сессии
        try:
            flag, country_name = get_country_flag_and_name(country_code) if country_code else ('🌐', 'Unknown')
            msg = (
                f"{flag} <b>Новая сессия ({country_name}):</b>\n"
                f"📱 Номер: <b>{phone_num}</b>\n"
                f"📄 Файл: <code>{session_file.name}</code>\n"
                f"⏳ Статус: начинаю конвертацию..."
            )
            send_telegram_notification(msg, country_code)
        except Exception:
            logging.exception("Не удалось отправить уведомление о новой сессии")

        client = TelegramClient(str(session_file), api_id, api_hash)
        await client.connect()

        if not await client.is_user_authorized():
            logging.warning(f"Сессия {session_file.name} не авторизована")
            await client.disconnect()
            return False

        # Пытаемся использовать opentele/ToTDesktop, но если этого модуля нет
        # — делаем безопасный fallback: просто копируем .session в папку tdata
        try:
            from opentele.api import UseCurrentSession

            tdesk = await client.ToTDesktop(flag=UseCurrentSession)

            # Удаляем старую папку tdata
            if tdata_path.exists():
                shutil.rmtree(tdata_path)

            tdata_path.mkdir(parents=True, exist_ok=True)
            # Если метод SaveTData присутствует — используем его
            if hasattr(tdesk, 'SaveTData'):
                tdesk.SaveTData(str(tdata_path))
            else:
                # Ненадёжный fallback — сохраняем сессию в папку
                shutil.copy2(str(session_file), str(tdata_path / session_file.name))

            logging.info(f"Успешно конвертировано: {session_file.name} -> {tdata_path}")

            # Копируем tdata в папку бота
            copy_tdata_to_bot(str(tdata_path), country_code)

            # Уведомление об успешной конверсии
            try:
                flag, country_name = get_country_flag_and_name(country_code) if country_code else ('🌐', 'Unknown')
                msg = (
                    f"✅ <b>Получен новый лог ({country_name}):</b>\n\n"
                    f"{flag} Успешно конвертирована сессия: <b>{phone_num}</b>\n"
                    f"📂 TData: <code>{tdata_path}</code>\n"
                    f"🤖 Скопирован в бота для выгрузки\n"
                )
                send_telegram_notification(msg, country_code)
            except Exception:
                logging.exception("Не удалось отправить уведомление об успешной конверсии")

            return str(tdata_path)

        except Exception as e:
            # Любая ошибка в opentele/SaveTData — делаем fallback
            logging.warning(f"opentele/ToTDesktop недоступен или ошибка: {e}. Выполняю fallback.")
            if tdata_path.exists():
                shutil.rmtree(tdata_path)
            tdata_path.mkdir(parents=True, exist_ok=True)
            shutil.copy2(str(session_file), str(tdata_path / session_file.name))
            logging.info(f"Fallback: скопировал сессию в {tdata_path}")

            # Копируем tdata в папку бота даже при fallback
            copy_tdata_to_bot(str(tdata_path), country_code)

            # Нотификация о fallback-результате
            try:
                flag, country_name = get_country_flag_and_name(country_code) if country_code else ('🌐', 'Unknown')
                msg = (
                    f"⚠️ <b>Fallback конвертация ({country_name}):</b>\n"
                    f"{flag} Сессия: <b>{phone_num}</b>\n"
                    f"📂 TData(fallback): <code>{tdata_path}</code>\n"
                    f"🤖 Скопирован в бота для выгрузки\n"
                    f"🔧 API_ID: <code>{api_id}</code>\n"
                    f"🔑 API_HASH: <code>{api_hash}</code>"
                )
                send_telegram_notification(msg, country_code)
            except Exception:
                logging.exception("Не удалось отправить уведомление о fallback-конверсии")

            return str(tdata_path)

    except Exception as e:
        logging.error(f"Ошибка при конвертации {session_file}: {e}")
        try:
            flag, country_name = get_country_flag_and_name(country_code) if country_code else ('🌐', 'Unknown')
            send_telegram_notification(f"❌ <b>Ошибка конвертации ({country_name}):</b>\n{flag} {phone_num}\n🚨 {e}", country_code)
        except Exception:
            logging.exception("Не удалось отправить уведомление об ошибке")
        return False

    finally:
        if client is not None:
            await client.disconnect()