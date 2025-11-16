"""Start command handler."""

from aiogram import Router, F
from aiogram.types import Message
from aiogram.filters import Command

from utils.keyboards import main_menu_keyboard

router = Router()


@router.message(Command("start"))
async def start_handler(message: Message):
    """Handle /start command - show main menu."""
    welcome_text = """
<b>🎮 Добро пожаловать в Админ-панель Gift Spin Wheel!</b>

Здесь вы можете:
📊 Просматривать статистику логов
💰 Управлять продажами

Выберите действие:
    """.strip()
    
    await message.answer(
        welcome_text,
        reply_markup=main_menu_keyboard(),
        parse_mode="HTML"
    )
