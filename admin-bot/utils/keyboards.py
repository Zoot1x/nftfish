"""Keyboard utilities for inline buttons."""

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from utils.callbacks import *
from utils.sales_service import SalesService
from utils.log_service import LogService
from utils.tdata_service import TdataService


def main_menu_keyboard() -> InlineKeyboardMarkup:
    """Main menu with statistics and sales buttons."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📊 Статистика логов", callback_data=LOGS_STATS),
            ],
            [
                InlineKeyboardButton(text="💰 Продажа", callback_data=SALES),
            ],
            [
                InlineKeyboardButton(text="📦 Экспорт TData", callback_data=TDATA_EXPORT),
            ],
        ]
    )


def logs_stats_keyboard() -> InlineKeyboardMarkup:
    """Statistics menu with time-based and country-based options."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📈 По времени", callback_data=LOGS_STATS_TIME),
                InlineKeyboardButton(text="🌍 По странам", callback_data=LOGS_STATS_COUNTRY),
            ],
            [
                InlineKeyboardButton(text="« Назад", callback_data=BACK_TO_MAIN),
            ],
        ]
    )


def logs_time_keyboard() -> InlineKeyboardMarkup:
    """Time period selection for log statistics."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📅 Сегодня", callback_data=LOGS_STATS_TIME_TODAY),
            ],
            [
                InlineKeyboardButton(text="📆 Неделя", callback_data=LOGS_STATS_TIME_WEEK),
            ],
            [
                InlineKeyboardButton(text="📅 Месяц", callback_data=LOGS_STATS_TIME_MONTH),
            ],
            [
                InlineKeyboardButton(text="📊 Все время", callback_data=LOGS_STATS_TIME_ALL),
            ],
            [
                InlineKeyboardButton(text="« Назад", callback_data=BACK_TO_LOGS_STATS),
            ],
        ]
    )


def logs_country_keyboard() -> InlineKeyboardMarkup:
    """Time period selection for country-based statistics."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📅 Сегодня", callback_data=LOGS_STATS_COUNTRY_TODAY),
            ],
            [
                InlineKeyboardButton(text="📆 Неделя", callback_data=LOGS_STATS_COUNTRY_WEEK),
            ],
            [
                InlineKeyboardButton(text="📅 Месяц", callback_data=LOGS_STATS_COUNTRY_MONTH),
            ],
            [
                InlineKeyboardButton(text="📊 Все время", callback_data=LOGS_STATS_COUNTRY_ALL),
            ],
            [
                InlineKeyboardButton(text="« Назад", callback_data=BACK_TO_LOGS_STATS),
            ],
        ]
    )


def sales_menu_keyboard() -> InlineKeyboardMarkup:
    """Sales menu with auto-sales and by-country options."""
    auto_enabled = SalesService.is_auto_sales_enabled()
    auto_status = "🟢 Автопродажа" if auto_enabled else "🔴 Автопродажа"
    
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text=auto_status, callback_data=SALES_AUTO),
            ],
            [
                InlineKeyboardButton(text="🌍 Продать по странам", callback_data=SALES_BY_COUNTRY),
            ],
            [
                InlineKeyboardButton(text="« Назад", callback_data=BACK_TO_MAIN),
            ],
        ]
    )


def sales_countries_keyboard() -> InlineKeyboardMarkup:
    """Country selection keyboard for manual sales."""
    countries = LogService.COUNTRY_FLAGS
    
    keyboard = []
    
    # Get all countries from COUNTRY_FLAGS
    for country_name, flag in countries.items():
        callback = f"{SALES_SELECT_COUNTRY}{country_name}"
        keyboard.append([
            InlineKeyboardButton(text=f"{flag} {country_name}", callback_data=callback)
        ])
    
    # Add back button
    keyboard.append([
        InlineKeyboardButton(text="« Назад", callback_data=BACK_TO_SALES)
    ])
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def sales_confirm_keyboard(country: str) -> InlineKeyboardMarkup:
    """Confirmation keyboard for selling to a specific country."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Продать", callback_data=f"{SALES_EXECUTE}{country}"),
                InlineKeyboardButton(text="❌ Отменить", callback_data=BACK_TO_SALES_COUNTRY),
            ],
        ]
    )


def tdata_export_keyboard() -> InlineKeyboardMarkup:
    """Tdata export menu keyboard."""
    available_countries = TdataService.get_available_countries()
    
    keyboard = []
    
    # Add country buttons
    for country_code, file_count in available_countries.items():
        callback = f"{TDATA_EXPORT_COUNTRY}{country_code}"
        keyboard.append([
            InlineKeyboardButton(text=f"📦 {country_code.upper()} ({file_count} файлов)", callback_data=callback)
        ])
    
    # Add export all button if countries available
    if available_countries:
        keyboard.append([
            InlineKeyboardButton(text="📦 Экспортировать все", callback_data=TDATA_EXPORT_ALL)
        ])
    
    # Add back button
    keyboard.append([
        InlineKeyboardButton(text="« Назад", callback_data=BACK_TO_MAIN)
    ])
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)
