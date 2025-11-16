"""Service for managing sales operations and auto-sales state."""

import json
from pathlib import Path
from datetime import datetime


class SalesService:
    """Manages auto-sales state and sales operations."""
    
    STATE_FILE = Path(__file__).parent.parent / "data" / "sales_state.json"
    
    @classmethod
    def _ensure_data_dir(cls):
        """Ensure data directory exists."""
        cls.STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def _load_state(cls) -> dict:
        """Load sales state from file."""
        cls._ensure_data_dir()
        if cls.STATE_FILE.exists():
            try:
                with open(cls.STATE_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return {"auto_sales_enabled": False, "sales_log": []}
        return {"auto_sales_enabled": False, "sales_log": []}
    
    @classmethod
    def _save_state(cls, state: dict):
        """Save sales state to file."""
        cls._ensure_data_dir()
        with open(cls.STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
    
    @classmethod
    def is_auto_sales_enabled(cls) -> bool:
        """Check if auto-sales is enabled."""
        state = cls._load_state()
        return state.get("auto_sales_enabled", False)
    
    @classmethod
    def toggle_auto_sales(cls) -> bool:
        """Toggle auto-sales state. Returns new state."""
        state = cls._load_state()
        new_state = not state.get("auto_sales_enabled", False)
        state["auto_sales_enabled"] = new_state
        cls._save_state(state)
        return new_state
    
    @classmethod
    def record_sale(cls, country: str, amount: float = 1.0) -> bool:
        """Record a sale transaction.
        
        Args:
            country: Country code or name
            amount: Amount sold (default 1.0)
        
        Returns:
            True if recorded successfully
        """
        try:
            state = cls._load_state()
            
            sale_record = {
                "timestamp": datetime.now().isoformat(),
                "country": country,
                "amount": amount,
                "status": "completed"
            }
            
            if "sales_log" not in state:
                state["sales_log"] = []
            
            state["sales_log"].append(sale_record)
            cls._save_state(state)
            return True
        except Exception as e:
            print(f"Error recording sale: {e}")
            return False
    
    @classmethod
    def get_sales_summary(cls) -> dict:
        """Get summary of all sales."""
        state = cls._load_state()
        sales_log = state.get("sales_log", [])
        
        summary = {
            "total_sales": len(sales_log),
            "total_amount": sum(s.get("amount", 1.0) for s in sales_log),
            "by_country": {},
            "auto_sales_enabled": state.get("auto_sales_enabled", False)
        }
        
        for sale in sales_log:
            country = sale.get("country", "Unknown")
            amount = sale.get("amount", 1.0)
            
            if country not in summary["by_country"]:
                summary["by_country"][country] = {"count": 0, "amount": 0.0}
            
            summary["by_country"][country]["count"] += 1
            summary["by_country"][country]["amount"] += amount
        
        return summary
