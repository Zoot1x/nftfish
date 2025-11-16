"""Main admin bot application."""

import asyncio
import logging
import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand

from handlers import start, stats, sales, tdata

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Bot token
ADMIN_BOT_TOKEN = os.getenv("ADMIN_BOT_TOKEN")
ADMIN_USER_ID = int(os.getenv("ADMIN_USER_ID", "0"))

if not ADMIN_BOT_TOKEN:
    raise ValueError("ADMIN_BOT_TOKEN not found in .env file")

# Initialize bot and dispatcher
bot = Bot(token=ADMIN_BOT_TOKEN)
dp = Dispatcher()

# Include routers
dp.include_router(start.router)
dp.include_router(stats.router)
dp.include_router(sales.router)
dp.include_router(tdata.router)


async def set_bot_commands():
    """Set bot commands in menu."""
    commands = [
        BotCommand(command="start", description="Открыть главное меню"),
        BotCommand(command="help", description="Справка"),
    ]
    await bot.set_my_commands(commands)


async def main():
    """Main bot function."""
    logger.info("Starting admin bot...")
    await set_bot_commands()
    
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
