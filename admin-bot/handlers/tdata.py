"""Tdata export handlers for admin bot."""

from aiogram import Router, F
from aiogram.types import CallbackQuery
import os
from dotenv import load_dotenv

from utils.callbacks import (
    TDATA_EXPORT, TDATA_EXPORT_COUNTRY, TDATA_EXPORT_ALL,
    BACK_TO_MAIN
)
from utils.keyboards import tdata_export_keyboard, main_menu_keyboard
from utils.tdata_service import TdataService

# Загрузить переменные окружения
load_dotenv()
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')

router = Router()


@router.callback_query(F.data == TDATA_EXPORT)
async def tdata_export_handler(query: CallbackQuery):
    """Show tdata export menu."""
    available = TdataService.get_available_countries()
    
    if not available:
        message_text = (
            "<b>📦 Экспорт TData</b>\n\n"
            "❌ Нет доступных tdata файлов для экспорта"
        )
    else:
        countries_list = "\n".join([f"• {code.upper()}: {count} файлов" for code, count in available.items()])
        message_text = (
            "<b>📦 Экспорт TData</b>\n\n"
            "Доступные страны:\n"
            f"{countries_list}\n\n"
            "Выберите страну или экспортируйте всё сразу:"
        )
    
    await query.answer()
    
    await query.message.edit_text(
        message_text,
        reply_markup=tdata_export_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data.startswith(TDATA_EXPORT_COUNTRY))
async def tdata_export_country_handler(query: CallbackQuery):
    """Export tdata for specific country."""
    country_code = query.data.replace(TDATA_EXPORT_COUNTRY, "")
    
    await query.answer("⏳ Создаю архив...", show_alert=False)
    
    # Create archive
    result = TdataService.create_archive(country_code)
    
    if result:
        archive_path, archive_name = result
        archive_info = TdataService.get_archive_info(archive_path)
        
        if archive_info:
            file_size = archive_info['size_mb']
            download_url = TdataService.get_download_url(archive_name, base_url=BACKEND_URL)
            
            message_text = (
                f"<b>📦 TData архив создан</b>\n\n"
                f"<b>Страна:</b> {country_code.upper()}\n"
                f"<b>Размер:</b> {file_size} МБ\n"
                f"<b>Файл:</b> <code>{archive_name}</code>\n\n"
                f"<a href='{download_url}'>📥 Скачать архив</a>\n\n"
                f"🗑️ <i>Папки будут удалены после выгрузки</i>"
            )
            
            # Delete archived folders
            TdataService.delete_archived_folders(country_code)
        else:
            message_text = (
                "<b>❌ Ошибка</b>\n\n"
                "Не удалось получить информацию об архиве"
            )
    else:
        message_text = (
            "<b>❌ Ошибка</b>\n\n"
            f"Не удалось создать архив для страны {country_code.upper()}"
        )
    
    await query.message.edit_text(
        message_text,
        reply_markup=tdata_export_keyboard(),
        parse_mode="HTML",
        disable_web_page_preview=False
    )


@router.callback_query(F.data == TDATA_EXPORT_ALL)
async def tdata_export_all_handler(query: CallbackQuery):
    """Export all tdata files."""
    await query.answer("⏳ Создаю архив всех файлов...", show_alert=False)
    
    # Create archive
    result = TdataService.create_all_archive()
    
    if result:
        archive_path, archive_name = result
        archive_info = TdataService.get_archive_info(archive_path)
        
        if archive_info:
            file_size = archive_info['size_mb']
            download_url = TdataService.get_download_url(archive_name, base_url=BACKEND_URL)
            
            message_text = (
                f"<b>📦 TData архив создан</b>\n\n"
                f"<b>Содержимое:</b> Все страны\n"
                f"<b>Размер:</b> {file_size} МБ\n"
                f"<b>Файл:</b> <code>{archive_name}</code>\n\n"
                f"<a href='{download_url}'>📥 Скачать архив</a>\n\n"
                f"🗑️ <i>Все папки будут удалены после выгрузки</i>"
            )
            
            # Delete all archived folders and cleanup old archives
            TdataService.delete_all_archived_folders()
            TdataService.cleanup_old_archives(keep_count=5)
        else:
            message_text = (
                "<b>❌ Ошибка</b>\n\n"
                "Не удалось получить информацию об архиве"
            )
    else:
        message_text = (
            "<b>❌ Ошибка</b>\n\n"
            "Не удалось создать архив со всеми файлами"
        )
    
    await query.message.edit_text(
        message_text,
        reply_markup=tdata_export_keyboard(),
        parse_mode="HTML",
        disable_web_page_preview=False
    )
