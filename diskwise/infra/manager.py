"""
Infra layer for destructive filesystem operations (Delete, Compress).
Follows safety rules defined in the core layer and enforces path sanitation.
"""

import os
import shutil
import zipfile
import platform
import subprocess
from pathlib import Path
from typing import Optional

from core.models import FileMetadata
from core.rules import determine_safety_status
from infra.scanner import sanitize_path

def delete_path(path_str: str, force: bool = False) -> bool:
    """
    Safely delete a file or directory.
    
    Args:
        path_str: Path to delete
        force: If True, bypass safety warnings (but not 'danger' status)
        
    Returns:
        True if successful, False otherwise.
    """
    try:
        path = sanitize_path(path_str)
        if not path.exists():
            return False

        # Final safety check
        python_installed = shutil.which("python") is not None or shutil.which("python3") is not None
        # Get size for metadata (needed for core rules)
        if path.is_dir():
            from infra.scanner import calculate_directory_size
            size = calculate_directory_size(path)
        else:
            size = path.stat().st_size
            
        metadata = FileMetadata(path=path, name=path.name, size=size)
        status = determine_safety_status(metadata, python_installed)
        
        if status == "danger":
            raise PermissionError(f"CRITICAL: Deletion of system path '{path}' is forbidden.")
        
        if status == "warning" and not force:
            raise PermissionError(f"Action required: Path '{path}' requires review before deletion.")

        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink()
        return True
    except Exception as e:
        raise e

def compress_path(path_str: str) -> str:
    """
    Compress a file or directory into a ZIP archive and delete original.
    
    Returns:
        The path to the new archive.
    """
    try:
        path = sanitize_path(path_str)
        if not path.exists():
            raise FileNotFoundError(f"Path '{path_str}' not found.")

        # Archive path (e.g., file.txt -> file.txt.zip)
        archive_base = str(path)
        
        if path.is_dir():
            # shutil.make_archive adds the .zip extension automatically
            result_path = shutil.make_archive(archive_base, 'zip', path)
            shutil.rmtree(path)
        else:
            result_path = f"{archive_base}.zip"
            with zipfile.ZipFile(result_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Security check: ensure path is relative to zip root
                arcname = path.name
                zipf.write(path, arcname)
            path.unlink()
            
        return result_path
    except Exception as e:
        raise e
