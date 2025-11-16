#!/usr/bin/env python3
"""Test script to verify log parsing."""

import sys
sys.path.insert(0, '/Users/zootix/Desktop/gift-spin-wheel/admin-bot')

from utils.log_service import LogService

print("=" * 70)
print("🔍 TESTING LOG PARSING")
print("=" * 70)

# Test reading logs
print("\n📊 Statistics by Time Period:")
print("-" * 70)

for period in ["today", "week", "month", "all"]:
    stats = LogService.count_logs_by_period(period)
    print(f"\n{period.upper()}:")
    print(f"  Total: {stats['total']}")
    print(f"  Successful: {stats['successful']}")
    print(f"  Failed: {stats['failed']}")
    print(f"  Fallback: {stats['fallback']}")
    if stats['total'] > 0:
        success_rate = int((stats['successful'] / stats['total']) * 100)
        print(f"  Success Rate: {success_rate}%")

print("\n\n📍 Statistics by Country:")
print("-" * 70)

for period in ["today", "week", "month", "all"]:
    stats = LogService.count_logs_by_country(period)
    print(f"\n{period.upper()}:")
    if stats:
        for code, count in sorted(stats.items(), key=lambda x: x[1], reverse=True):
            flag = LogService.COUNTRY_FLAGS.get(code, '🌐')
            name = LogService.COUNTRY_NAMES.get(code, code.upper())
            print(f"  {flag} {name}: {count}")
        print(f"  Total countries: {len(stats)}")
    else:
        print("  No data")

print("\n\n✅ LOG PARSING TEST COMPLETE")
print("=" * 70)
