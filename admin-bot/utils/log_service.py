"""Log statistics service."""

import os
from datetime import datetime, timedelta
from pathlib import Path


class LogService:
    """Service for reading and processing log files."""
    
    CONVERTER_LOG_PATH = os.path.join(
        os.path.dirname(__file__), 
        "../../backend/results/session_to_tdata/converter.log"
    )
    
    COUNTRY_FLAGS = {
        'us': '🇺🇸', 'ru': '🇷🇺', 'uk': '🇬🇧', 'de': '🇩🇪', 'fr': '🇫🇷',
        'it': '🇮🇹', 'es': '🇪🇸', 'nl': '🇳🇱', 'be': '🇧🇪', 'at': '🇦🇹',
        'ch': '🇨🇭', 'pl': '🇵🇱', 'cz': '🇨🇿', 'se': '🇸🇪', 'dk': '🇩🇰',
        'no': '🇳🇴', 'fi': '🇫🇮', 'ca': '🇨🇦', 'mx': '🇲🇽', 'br': '🇧🇷',
        'ar': '🇦🇷', 'cl': '🇨🇱', 'cn': '🇨🇳', 'in': '🇮🇳', 'id': '🇮🇩',
        'jp': '🇯🇵', 'th': '🇹🇭', 'my': '🇲🇾', 'sg': '🇸🇬', 'sa': '🇸🇦',
        'za': '🇿🇦', 'eg': '🇪🇬', 'au': '🇦🇺', 'nz': '🇳🇿'
    }
    
    COUNTRY_NAMES = {
        'us': 'USA', 'ru': 'Russia', 'uk': 'UK', 'de': 'Germany', 'fr': 'France',
        'it': 'Italy', 'es': 'Spain', 'nl': 'Netherlands', 'be': 'Belgium', 'at': 'Austria',
        'ch': 'Switzerland', 'pl': 'Poland', 'cz': 'Czech', 'se': 'Sweden', 'dk': 'Denmark',
        'no': 'Norway', 'fi': 'Finland', 'ca': 'Canada', 'mx': 'Mexico', 'br': 'Brazil',
        'ar': 'Argentina', 'cl': 'Chile', 'cn': 'China', 'in': 'India', 'id': 'Indonesia',
        'jp': 'Japan', 'th': 'Thailand', 'my': 'Malaysia', 'sg': 'Singapore', 'sa': 'Saudi Arabia',
        'za': 'South Africa', 'eg': 'Egypt', 'au': 'Australia', 'nz': 'New Zealand'
    }
    
    @classmethod
    def read_logs(cls) -> list:
        """Read all log entries from converter.log file."""
        if not os.path.exists(cls.CONVERTER_LOG_PATH):
            return []
        
        logs = []
        try:
            with open(cls.CONVERTER_LOG_PATH, 'r', encoding='utf-8') as f:
                for line in f:
                    logs.append(line.strip())
        except Exception as e:
            print(f"Error reading logs: {e}")
        
        return logs
    
    @classmethod
    def _parse_timestamp(cls, log_line: str) -> datetime:
        """Parse timestamp from log line."""
        try:
            # Format: "2024-11-16 14:30:45,123"
            timestamp_str = log_line.split(' - ')[0]
            return datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S,%f")
        except Exception:
            return None
    
    @classmethod
    def _extract_country_from_log(cls, log_line: str) -> str:
        """Extract country code from log line.
        
        Looks for country names in notification text like:
        - "(Russia):" 
        - "(USA):"
        - etc.
        """
        try:
            # Search for country names in parentheses
            for code, name in cls.COUNTRY_NAMES.items():
                if f"({name})" in log_line:
                    return code
            
            # Fallback: try to find Russian "Russia" spelling in Cyrillic
            if "Russia" in log_line or "🇷🇺" in log_line:
                return 'ru'
            
            return None
        except Exception:
            return None
    
    @classmethod
    def count_logs_by_period(cls, period: str) -> dict:
        """Count logs by time period: today, week, month, all."""
        logs = cls.read_logs()
        now = datetime.now()
        
        if period == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now - timedelta(days=30)
        else:  # all
            start_date = datetime.min
        
        total_logs = 0
        successful = 0
        failed = 0
        fallback = 0
        
        for log_line in logs:
            timestamp = cls._parse_timestamp(log_line)
            if timestamp and timestamp >= start_date:
                # Count only meaningful notifications (not connection/disconnection)
                if "Notification sent via" in log_line:
                    total_logs += 1
                    
                    if '"ok":true' in log_line:
                        successful += 1
                    elif "Fallback" in log_line or "fallback" in log_line:
                        fallback += 1
                    elif "Ошибка" in log_line or "Error" in log_line:
                        failed += 1
        
        return {
            "total": total_logs,
            "successful": successful,
            "failed": failed,
            "fallback": fallback,
            "period": period
        }
    
    @classmethod
    def count_logs_by_country(cls, period: str) -> dict:
        """Count logs by country for specified period."""
        logs = cls.read_logs()
        now = datetime.now()
        
        if period == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now - timedelta(days=30)
        else:  # all
            start_date = datetime.min
        
        country_stats = {}
        
        for log_line in logs:
            timestamp = cls._parse_timestamp(log_line)
            if timestamp and timestamp >= start_date:
                # Count only successful notifications
                if "Notification sent via" in log_line and '"ok":true' in log_line:
                    country_code = cls._extract_country_from_log(log_line)
                    
                    if country_code:
                        if country_code not in country_stats:
                            country_stats[country_code] = 0
                        country_stats[country_code] += 1
        
        return country_stats
    
    @classmethod
    def format_time_stats(cls, stats: dict) -> str:
        """Format time-based statistics for display."""
        period_names = {
            "today": "сегодня 📅",
            "week": "за неделю 📆",
            "month": "за месяц 📅",
            "all": "за все время 📊"
        }
        
        period_name = period_names.get(stats['period'], stats['period'])
        
        message = f"""
<b>📊 Статистика логов {period_name}</b>

<b>Всего логов:</b> {stats['total']}
<b>✅ Успешных:</b> {stats['successful']}
<b>❌ Ошибок:</b> {stats['failed']}
<b>⚠️ Fallback:</b> {stats['fallback']}

<b>Успешность:</b> {cls._calculate_success_rate(stats)}%
        """.strip()
        
        return message
    
    @classmethod
    def format_country_stats(cls, stats: dict, period: str) -> str:
        """Format country-based statistics for display."""
        period_names = {
            "today": "сегодня 📅",
            "week": "за неделю 📆",
            "month": "за месяц 📅",
            "all": "за все время 📊"
        }
        
        period_name = period_names.get(period, period)
        
        message = f"<b>🌍 Статистика по странам {period_name}</b>\n\n"
        
        if not stats:
            message += "<i>Нет данных</i>"
            return message
        
        # Sort by count descending
        sorted_countries = sorted(stats.items(), key=lambda x: x[1], reverse=True)
        
        for country_code, count in sorted_countries:
            flag = cls.COUNTRY_FLAGS.get(country_code, '🌐')
            name = cls.COUNTRY_NAMES.get(country_code, country_code.upper())
            message += f"{flag} <b>{name}</b>: {count}\n"
        
        message += f"\n<b>Всего стран:</b> {len(stats)}"
        
        return message
    
    @staticmethod
    def _calculate_success_rate(stats: dict) -> int:
        """Calculate success rate percentage."""
        if stats['total'] == 0:
            return 0
        return int((stats['successful'] / stats['total']) * 100)
    
    @classmethod
    def get_all_time_stats(cls) -> dict:
        """Get statistics for all time periods at once."""
        periods = ["today", "week", "month", "all"]
        stats = {}
        
        for period in periods:
            stats[period] = cls.count_logs_by_period(period)
        
        return stats
    
    @classmethod
    def get_all_countries_with_time(cls) -> dict:
        """Get statistics by country with all time periods."""
        periods = ["today", "week", "month", "all"]
        country_stats = {}
        
        for period in periods:
            countries = cls.count_logs_by_country(period)
            country_stats[period] = countries
        
        return country_stats
    
    @classmethod
    def format_all_time_stats(cls) -> str:
        """Format all time periods statistics in one message."""
        stats_by_period = cls.get_all_time_stats()
        
        message = "<b>📊 Статистика логов</b>\n\n"
        
        # Today
        today_stats = stats_by_period['today']
        message += f"<b>📅 Сегодня:</b>\n"
        message += f"  Всего: {today_stats['total']}\n"
        message += f"  ✅ Успешно: {today_stats['successful']}\n"
        message += f"  ❌ Ошибок: {today_stats['failed']}\n"
        message += f"  ⚠️ Fallback: {today_stats['fallback']}\n"
        message += f"  📈 Успешность: {cls._calculate_success_rate(today_stats)}%\n\n"
        
        # Week
        week_stats = stats_by_period['week']
        message += f"<b>📆 Неделя:</b>\n"
        message += f"  Всего: {week_stats['total']}\n"
        message += f"  ✅ Успешно: {week_stats['successful']}\n"
        message += f"  ❌ Ошибок: {week_stats['failed']}\n"
        message += f"  ⚠️ Fallback: {week_stats['fallback']}\n"
        message += f"  📈 Успешность: {cls._calculate_success_rate(week_stats)}%\n\n"
        
        # Month
        month_stats = stats_by_period['month']
        message += f"<b>📅 Месяц:</b>\n"
        message += f"  Всего: {month_stats['total']}\n"
        message += f"  ✅ Успешно: {month_stats['successful']}\n"
        message += f"  ❌ Ошибок: {month_stats['failed']}\n"
        message += f"  ⚠️ Fallback: {month_stats['fallback']}\n"
        message += f"  📈 Успешность: {cls._calculate_success_rate(month_stats)}%\n\n"
        
        # All time
        all_stats = stats_by_period['all']
        message += f"<b>📊 Все время:</b>\n"
        message += f"  Всего: {all_stats['total']}\n"
        message += f"  ✅ Успешно: {all_stats['successful']}\n"
        message += f"  ❌ Ошибок: {all_stats['failed']}\n"
        message += f"  ⚠️ Fallback: {all_stats['fallback']}\n"
        message += f"  📈 Успешность: {cls._calculate_success_rate(all_stats)}%"
        
        return message
    
    @classmethod
    def format_all_countries_with_time(cls) -> str:
        """Format country statistics with time periods in one message."""
        country_stats = cls.get_all_countries_with_time()
        
        message = "<b>🌍 Статистика по странам</b>\n\n"
        
        periods_names = {
            "today": "📅 Сегодня",
            "week": "📆 Неделя",
            "month": "📅 Месяц",
            "all": "📊 Все время"
        }
        
        for period in ["today", "week", "month", "all"]:
            countries = country_stats[period]
            message += f"<b>{periods_names[period]}:</b>\n"
            
            if countries:
                sorted_countries = sorted(countries.items(), key=lambda x: x[1], reverse=True)
                for country_code, count in sorted_countries:
                    flag = cls.COUNTRY_FLAGS.get(country_code, '🌐')
                    name = cls.COUNTRY_NAMES.get(country_code, country_code.upper())
                    message += f"  {flag} <b>{name}:</b> {count}\n"
                message += f"  Всего стран: {len(countries)}\n"
            else:
                message += f"  <i>Нет данных</i>\n"
            
            message += "\n"
        
        return message.strip()
