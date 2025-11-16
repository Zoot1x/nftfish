"""Service for managing tdata archive operations."""

import os
import shutil
import zipfile
from pathlib import Path
from datetime import datetime
from typing import Optional, Tuple


class TdataService:
    """Service for creating tdata archives and managing downloads."""
    
    # Paths
    TDATAS_DIR = Path(__file__).parent.parent / "tdatas"
    ARCHIVES_DIR = Path(__file__).parent.parent / "archives"
    
    @classmethod
    def _ensure_dirs(cls):
        """Ensure necessary directories exist."""
        cls.ARCHIVES_DIR.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_available_countries(cls) -> dict:
        """Get list of countries with available tdata folders.
        
        Returns:
            Dictionary with country codes and folder counts
        """
        available = {}
        
        if not cls.TDATAS_DIR.exists():
            return available
        
        for country_dir in cls.TDATAS_DIR.iterdir():
            if country_dir.is_dir():
                # Count subdirectories (account folders) in each country
                account_folders = [d for d in country_dir.iterdir() if d.is_dir()]
                folder_count = len(account_folders)
                if folder_count > 0:
                    available[country_dir.name] = folder_count
        
        return available
    
    @classmethod
    def create_archive(cls, country_code: str) -> Optional[Tuple[str, str]]:
        """Create a zip archive of all tdata folders for a country.
        
        Args:
            country_code: Country code (e.g., 'ru', 'us')
        
        Returns:
            Tuple of (archive_path, file_name) if successful, None otherwise
        """
        try:
            cls._ensure_dirs()
            
            country_dir = cls.TDATAS_DIR / country_code
            
            if not country_dir.exists():
                print(f"Country directory not found: {country_dir}")
                return None
            
            # Get list of account folders
            account_folders = [d for d in country_dir.iterdir() if d.is_dir()]
            if not account_folders:
                print(f"No account folders found in {country_dir}")
                return None
            
            # Create archive filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_name = f"tdata_{country_code}_{timestamp}.zip"
            archive_path = cls.ARCHIVES_DIR / archive_name
            
            # Create zip archive with all folders
            with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for account_folder in account_folders:
                    # Recursively add all files from account folder
                    for file_path in account_folder.rglob("*"):
                        if file_path.is_file():
                            # Get relative path within archive
                            arcname = file_path.relative_to(country_dir)
                            zipf.write(file_path, arcname)
            
            print(f"✅ Archive created: {archive_path}")
            return (str(archive_path), archive_name)
        
        except Exception as e:
            print(f"❌ Error creating archive: {e}")
            return None
    
    @classmethod
    def create_all_archive(cls) -> Optional[Tuple[str, str]]:
        """Create a zip archive of all tdata folders from all countries.
        
        Returns:
            Tuple of (archive_path, file_name) if successful, None otherwise
        """
        try:
            cls._ensure_dirs()
            
            if not cls.TDATAS_DIR.exists():
                return None
            
            # Get all country directories
            country_dirs = [d for d in cls.TDATAS_DIR.iterdir() if d.is_dir()]
            if not country_dirs:
                print("No country directories found")
                return None
            
            # Check if any country has account folders
            has_accounts = False
            for country_dir in country_dirs:
                account_folders = [d for d in country_dir.iterdir() if d.is_dir()]
                if account_folders:
                    has_accounts = True
                    break
            
            if not has_accounts:
                print("No account folders found in any country")
                return None
            
            # Create archive filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_name = f"tdata_all_{timestamp}.zip"
            archive_path = cls.ARCHIVES_DIR / archive_name
            
            # Create zip archive with all country folders
            with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for country_dir in country_dirs:
                    account_folders = [d for d in country_dir.iterdir() if d.is_dir()]
                    for account_folder in account_folders:
                        for file_path in account_folder.rglob("*"):
                            if file_path.is_file():
                                # Get relative path within archive (keep country/account structure)
                                arcname = file_path.relative_to(cls.TDATAS_DIR)
                                zipf.write(file_path, arcname)
            
            print(f"✅ Archive created: {archive_path}")
            return (str(archive_path), archive_name)
        
        except Exception as e:
            print(f"❌ Error creating archive: {e}")
            return None
    
    @classmethod
    def get_archive_info(cls, archive_path: str) -> Optional[dict]:
        """Get information about archive file.
        
        Args:
            archive_path: Path to archive file
        
        Returns:
            Dictionary with file info or None if file doesn't exist
        """
        try:
            path = Path(archive_path)
            
            if not path.exists():
                return None
            
            size_bytes = path.stat().st_size
            size_mb = size_bytes / (1024 * 1024)
            
            return {
                "name": path.name,
                "path": str(path),
                "size_bytes": size_bytes,
                "size_mb": round(size_mb, 2),
                "created": datetime.fromtimestamp(path.stat().st_ctime).isoformat()
            }
        except Exception as e:
            print(f"Error getting archive info: {e}")
            return None
    
    @classmethod
    def cleanup_old_archives(cls, keep_count: int = 10):
        """Clean up old archive files, keeping only the most recent.
        
        Args:
            keep_count: Number of recent archives to keep
        """
        try:
            if not cls.ARCHIVES_DIR.exists():
                return
            
            archives = sorted(
                cls.ARCHIVES_DIR.glob("*.zip"),
                key=lambda p: p.stat().st_ctime,
                reverse=True
            )
            
            if len(archives) > keep_count:
                for archive in archives[keep_count:]:
                    archive.unlink()
                    print(f"Deleted old archive: {archive.name}")
        
        except Exception as e:
            print(f"Error during cleanup: {e}")
    
    @classmethod
    def get_download_url(cls, archive_name: str, base_url: str = "http://localhost:3001") -> str:
        """Generate download URL for archive.
        
        Args:
            archive_name: Name of archive file
            base_url: Base URL for downloads (adjust to your server)
        
        Returns:
            Full download URL
        """
        return f"{base_url}/archives/{archive_name}"
    
    @classmethod
    def delete_archived_folders(cls, country_code: str) -> bool:
        """Delete all tdata folders for a country after archiving.
        
        Args:
            country_code: Country code (e.g., 'ru', 'us')
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            country_dir = cls.TDATAS_DIR / country_code
            
            if not country_dir.exists():
                print(f"Country directory not found: {country_dir}")
                return False
            
            # Get all account folders
            account_folders = [d for d in country_dir.iterdir() if d.is_dir()]
            
            if not account_folders:
                print(f"No folders to delete in {country_code}")
                return False
            
            # Delete each folder
            deleted_count = 0
            for account_folder in account_folders:
                try:
                    shutil.rmtree(account_folder)
                    print(f"✅ Deleted: {account_folder}")
                    deleted_count += 1
                except Exception as e:
                    print(f"❌ Error deleting {account_folder}: {e}")
            
            print(f"✅ Deleted {deleted_count} folders from {country_code}")
            return deleted_count > 0
        
        except Exception as e:
            print(f"❌ Error in delete_archived_folders: {e}")
            return False
    
    @classmethod
    def delete_all_archived_folders(cls) -> bool:
        """Delete all tdata folders from all countries after archiving.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not cls.TDATAS_DIR.exists():
                return False
            
            country_dirs = [d for d in cls.TDATAS_DIR.iterdir() if d.is_dir()]
            total_deleted = 0
            
            for country_dir in country_dirs:
                if cls.delete_archived_folders(country_dir.name):
                    total_deleted += 1
            
            print(f"✅ Deleted tdata folders from {total_deleted} countries")
            return total_deleted > 0
        
        except Exception as e:
            print(f"❌ Error in delete_all_archived_folders: {e}")
            return False
