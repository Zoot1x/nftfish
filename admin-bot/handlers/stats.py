"""Statistics callback handlers."""

from aiogram import Router, F
from aiogram.types import CallbackQuery

from utils.callbacks import *
from utils.keyboards import (
    main_menu_keyboard, 
    logs_stats_keyboard, 
    logs_time_keyboard,
    logs_country_keyboard,
    sales_menu_keyboard
)
from utils.log_service import LogService

router = Router()


# Main menu
@router.callback_query(F.data == LOGS_STATS)
async def logs_stats_handler(query: CallbackQuery):
    """Show logs statistics menu."""
    message = """
<b>📊 Статистика логов</b>

Выберите тип статистики:
• <b>По времени</b> - см. логи за период
• <b>По странам</b> - см. логи по странам за период
    """.strip()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_stats_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == SALES)
async def sales_handler(query: CallbackQuery):
    """Show sales menu."""
    message = """
<b>💰 Продажа</b>

Выберите режим продажи:
    """.strip()
    
    await query.message.edit_text(
        message,
        reply_markup=sales_menu_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()
    await query.answer()


# Time-based statistics
@router.callback_query(F.data == LOGS_STATS_TIME)
async def logs_time_menu_handler(query: CallbackQuery):
    """Show time period selection menu."""
    message = LogService.format_all_time_stats()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_time_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_TIME_TODAY)
async def logs_time_today_handler(query: CallbackQuery):
    """Show statistics for today."""
    message = LogService.format_all_time_stats()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_time_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_TIME_WEEK)
async def logs_time_week_handler(query: CallbackQuery):
    """Show statistics for week."""
    message = LogService.format_all_time_stats()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_time_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_TIME_MONTH)
async def logs_time_month_handler(query: CallbackQuery):
    """Show statistics for month."""
    message = LogService.format_all_time_stats()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_time_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_TIME_ALL)
async def logs_time_all_handler(query: CallbackQuery):
    """Show statistics for all time."""
    message = LogService.format_all_time_stats()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_time_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


# Country-based statistics
@router.callback_query(F.data == LOGS_STATS_COUNTRY)
async def logs_country_menu_handler(query: CallbackQuery):
    """Show time period selection for country statistics."""
    message = LogService.format_all_countries_with_time()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_country_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_COUNTRY_TODAY)
async def logs_country_today_handler(query: CallbackQuery):
    """Show country statistics for today."""
    message = LogService.format_all_countries_with_time()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_country_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_COUNTRY_WEEK)
async def logs_country_week_handler(query: CallbackQuery):
    """Show country statistics for week."""
    message = LogService.format_all_countries_with_time()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_country_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_COUNTRY_MONTH)
async def logs_country_month_handler(query: CallbackQuery):
    """Show country statistics for month."""
    message = LogService.format_all_countries_with_time()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_country_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == LOGS_STATS_COUNTRY_ALL)
async def logs_country_all_handler(query: CallbackQuery):
    """Show country statistics for all time."""
    message = LogService.format_all_countries_with_time()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_country_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


# Back buttons
@router.callback_query(F.data == BACK_TO_MAIN)
async def back_to_main_handler(query: CallbackQuery):
    """Go back to main menu."""
    welcome_text = """
<b>🎮 Админ-панель Gift Spin Wheel</b>

Выберите действие:
    """.strip()
    
    await query.message.edit_text(
        welcome_text,
        reply_markup=main_menu_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()


@router.callback_query(F.data == BACK_TO_LOGS_STATS)
async def back_to_logs_stats_handler(query: CallbackQuery):
    """Go back to logs statistics menu."""
    message = """
<b>📊 Статистика логов</b>

Выберите тип статистики:
• <b>По времени</b> - см. логи за период
• <b>По странам</b> - см. логи по странам за период
    """.strip()
    
    await query.message.edit_text(
        message,
        reply_markup=logs_stats_keyboard(),
        parse_mode="HTML"
    )
    await query.answer()
