"""
Infra layer for filesystem scanning and metadata collection.

This module handles all I/O operations and enforces safety constraints
such as path validation and allowed base directories.
"""

import os
import platform
from pathlib import Path
from typing import List, Generator, Optional

from core.models import FileMetadata


# =============================================================================
# Security & Path Validation
# =============================================================================

# Allowed base directories for scanning (prevents path traversal)
ALLOWED_BASE_PATHS = [
    Path.home(),
    Path("/tmp"),
    Path("/var/tmp"),
]

# Windows-specific paths
if platform.system() == "Windows":
    ALLOWED_BASE_PATHS.extend([
        Path(os.environ.get("USERPROFILE", "C:/")),
        Path("C:/Temp"),
    ])


def is_path_allowed(target_path: Path) -> bool:
    """
    Check if a path is within allowed base directories.
    Prevents path traversal attacks.
    """
    try:
        # Resolve to handle symlinks and relative parts
        resolved_path = target_path.resolve()
        
        for base_path in ALLOWED_BASE_PATHS:
            try:
                resolved_base = base_path.resolve()
                if resolved_path == resolved_base or resolved_base in resolved_path.parents:
                    return True
            except (OSError, ValueError):
                continue
        
        return False
    except (OSError, ValueError):
        return False


def sanitize_path(path_str: str) -> Path:
    """
    Sanitize and validate a path string.
    
    Args:
        path_str: The path string to sanitize.
        
    Returns:
        A validated Path object.
        
    Raises:
        ValueError: If path is invalid or not allowed.
    """
    # Expand user home directory
    expanded_path = Path(path_str).expanduser()
    
    # Check for path traversal attempts explicitly
    if ".." in path_str:
        raise ValueError("Path traversal attempt detected ('..')")
    
    # Validate path is allowed
    if not is_path_allowed(expanded_path):
        raise ValueError(f"Path '{path_str}' is NOT in allowed directories")
    
    return expanded_path


# =============================================================================
# File Analysis
# =============================================================================

CATEGORY_PATTERNS = {
    "Python Cache": ["__pycache__", ".pytest_cache", ".mypy_cache", ".pyc", ".pyo"],
    "Node Modules": ["node_modules"],
    "Log Files": [".log", "logs/"],
    "Temp Files": ["tmp", "temp", ".tmp"],
    "Cache": [".cache", "cache/"],
    "Build Artifacts": ["dist/", "build/", ".tox", ".eggs"],
    "Virtual Environments": [".venv", "venv/", "env/", ".env/"],
}


def get_file_category(path: Path) -> str:
    """Determine the category of a file/directory based on its path/extension."""
    name = path.name.lower()
    path_str = str(path).lower()
    
    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if pattern in name or (pattern.endswith('/') and pattern[:-1] in path_str):
                return category
    
    if path.is_dir():
        return "Directory"
    
    # Check file extension
    ext = path.suffix.lower()
    if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']:
        return "Images"
    elif ext in ['.mp4', '.avi', '.mkv', '.mov']:
        return "Videos"
    elif ext in ['.mp3', '.wav', '.flac', '.aac']:
        return "Audio"
    elif ext in ['.pdf', '.doc', '.docx', '.txt', '.md']:
        return "Documents"
    elif ext in ['.zip', '.tar', '.gz', '.bz2', '.7z', '.rar']:
        return "Archives"
    
    return "Other"


def calculate_directory_size(path: Path) -> int:
    """Calculate total size of a directory recursively, safely."""
    total = 0
    try:
        for entry in os.scandir(path):
            if entry.is_file(follow_symlinks=False):
                total += entry.stat(follow_symlinks=False).st_size
            elif entry.is_dir(follow_symlinks=False):
                total += calculate_directory_size(Path(entry.path))
    except (PermissionError, OSError):
        pass
    return total


# =============================================================================
# Scanning
# =============================================================================

def scan_path(
    path: Path, 
    max_depth: int = 2, 
    current_depth: int = 0
) -> Generator[FileMetadata, None, None]:
    """
    Recursively scan a directory and yield FileMetadata objects.
    
    Args:
        path: Directory to scan
        max_depth: Maximum recursion depth
        current_depth: Current depth in recursion
    """
    if current_depth > max_depth:
        return

    try:
        for entry in os.scandir(path):
            try:
                is_dir = entry.is_dir(follow_symlinks=False)
                size = 0
                
                if is_dir:
                    # Full recursive size calculation on every directory causes
                    # severe slowdown on large trees (O(n^2)-like behavior).
                    # We only need full directory sizes at leaf scan depth,
                    # because API totals count only leaf directories/files.
                    if current_depth >= max_depth:
                        size = calculate_directory_size(Path(entry.path))
                else:
                    size = entry.stat(follow_symlinks=False).st_size
                
                yield FileMetadata(
                    path=Path(entry.path),
                    name=entry.name,
                    size=size
                )
                
                # Recurse into directories if depth allows
                if is_dir and current_depth < max_depth:
                    yield from scan_path(Path(entry.path), max_depth, current_depth + 1)
                    
            except (PermissionError, OSError):
                continue
    except (PermissionError, OSError):
        pass
