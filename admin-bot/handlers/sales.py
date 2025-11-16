"""Sales handlers for admin bot."""

from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from utils.callbacks import (
    SALES, SALES_AUTO, SALES_BY_COUNTRY, 
    SALES_SELECT_COUNTRY, SALES_CONFIRM, SALES_EXECUTE,
    BACK_TO_MAIN, BACK_TO_SALES, BACK_TO_SALES_COUNTRY
)
from utils.keyboards import (
    main_menu_keyboard, sales_menu_keyboard, 
    sales_countries_keyboard, sales_confirm_keyboard
)
from utils.sales_service import SalesService
from utils.log_service import LogService

router = Router()


@router.callback_query(F.data == SALES)
async def sales_handler(query: CallbackQuery):
    """Main sales menu handler."""
    await query.answer()
    
    message_text = (
        "<b>💰 Продажа</b>\n\n"
        "Выберите режим продажи:"
    )
    
    await query.message.edit_text(
        message_text,
        reply_markup=sales_menu_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data == SALES_AUTO)
async def sales_auto_handler(query: CallbackQuery):
    """Toggle auto-sales on/off."""
    new_state = SalesService.toggle_auto_sales()
    
    status_text = "включена" if new_state else "отключена"
    status_emoji = "🟢" if new_state else "🔴"
    
    message_text = (
        "<b>💰 Продажа</b>\n\n"
        f"Автопродажа {status_emoji} {status_text}\n\n"
        "Выберите режим продажи:"
    )
    
    await query.answer(f"Автопродажа {status_emoji} {status_text}", show_alert=True)
    
    await query.message.edit_text(
        message_text,
        reply_markup=sales_menu_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data == SALES_BY_COUNTRY)
async def sales_by_country_handler(query: CallbackQuery):
    """Show country selection for manual sales."""
    await query.answer()
    
    message_text = (
        "<b>🌍 Продать по странам</b>\n\n"
        "Выберите страну для продажи:"
    )
    
    await query.message.edit_text(
        message_text,
        reply_markup=sales_countries_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data.startswith(SALES_SELECT_COUNTRY))
async def sales_select_country_handler(query: CallbackQuery):
    """Handle country selection for sales."""
    country = query.data.replace(SALES_SELECT_COUNTRY, "")
    
    # Get country flag
    country_flags = LogService.COUNTRY_FLAGS
    flag = country_flags.get(country, "🌍")
    
    message_text = (
        f"<b>{flag} Подтверждение продажи</b>\n\n"
        f"Вы хотите продать для <b>{country}</b>?\n\n"
        "Нажмите ✅ для подтверждения или ❌ для отмены"
    )
    
    await query.answer()
    
    await query.message.edit_text(
        message_text,
        reply_markup=sales_confirm_keyboard(country),
        parse_mode="HTML"
    )


@router.callback_query(F.data.startswith(SALES_EXECUTE))
async def sales_execute_handler(query: CallbackQuery):
    """Execute the sale for selected country."""
    country = query.data.replace(SALES_EXECUTE, "")
    
    # Record the sale
    success = SalesService.record_sale(country, 1.0)
    
    if success:
        country_flags = LogService.COUNTRY_FLAGS
        flag = country_flags.get(country, "🌍")
        
        message_text = (
            f"<b>✅ Продажа выполнена</b>\n\n"
            f"{flag} {country}: 1 шт.\n\n"
            "Возвращаем в меню продажи..."
        )
        
        await query.answer("✅ Продажа успешно выполнена!", show_alert=True)
    else:
        message_text = (
            "<b>❌ Ошибка</b>\n\n"
            "Не удалось выполнить продажу. Попробуйте позже."
        )
        
        await query.answer("❌ Ошибка при выполнении продажи", show_alert=True)
    
    # Return to sales menu
    await query.message.edit_text(
        message_text,
        parse_mode="HTML"
    )
    
    # Show sales menu after 1 second by sending new message
    await query.message.edit_text(
        "<b>💰 Продажа</b>\n\nВыберите режим продажи:",
        reply_markup=sales_menu_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data == BACK_TO_SALES)
async def back_to_sales_handler(query: CallbackQuery):
    """Go back to sales menu from country selection."""
    await query.answer()
    
    message_text = (
        "<b>💰 Продажа</b>\n\n"
        "Выберите режим продажи:"
    )
    
    await query.message.edit_text(
        message_text,
        reply_markup=sales_menu_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data == BACK_TO_SALES_COUNTRY)
async def back_to_sales_country_handler(query: CallbackQuery):
    """Go back to country selection from confirmation."""
    await query.answer()
    
    message_text = (
        "<b>🌍 Продать по странам</b>\n\n"
        "Выберите страну для продажи:"
    )
    
    await query.message.edit_text(
        message_text,
        reply_markup=sales_countries_keyboard(),
        parse_mode="HTML"
    )
