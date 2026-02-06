"""
Core business rules for identifying files safe to delete or compress.

This module contains pure business logic with no I/O operations
and no external dependencies. All functions are deterministic
and operate solely on their inputs.
"""

from pathlib import Path
from typing import Set, List

from core.models import FileMetadata


# Directories that indicate a Python package that can be safely deleted
# if Python is installed (can be reinstalled via pip)
PYTHON_PKG_INDICATORS: Set[str] = {
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".tox",
    ".eggs",
    "*.egg-info",
    ".venv",
    "venv",
    "env",
    ".env",
    "dist",
    "build",
}

# File patterns that are Python cache files
PYTHON_CACHE_FILES: Set[str] = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".so",
    ".egg",
}

# System paths that are dangerous to delete
SYSTEM_PATHS: List[str] = [
    "/System",
    "/Windows",
    "/usr/bin",
    "/bin",
    "/sbin",
    "/lib",
    "/etc",
    "/var/root",
]

# User directories that should be treated with caution
USER_DOCUMENT_PATHS: List[str] = [
    "Documents",
    "Desktop",
    "Pictures",
    "Videos",
    "Music",
    "Downloads",
]

# Known safe temporary/cache patterns
SAFE_PATTERNS: List[str] = [
    "tmp",
    "temp",
    "cache",
    "log",
    ".cache",
    "__pycache__",
    ".pytest_cache",
]


def is_python_pkg_safe_to_delete(
    file: FileMetadata,
    python_installed: bool,
) -> bool:
    """
    Determine if a file or directory is a Python package artifact
    safe to delete when Python is installed.
    """
    if not python_installed:
        return False

    name = file.name
    path = file.path

    # Check if it's a known Python cache/build directory
    if name in PYTHON_PKG_INDICATORS:
        return True

    # Check if it's a Python cache file
    if any(name.endswith(ext) for ext in PYTHON_CACHE_FILES):
        return True

    # Check for .pyc files in __pycache__ directories
    if path.parent.name == "__pycache__":
        return True

    # Check for pip wheel cache patterns
    if "pip-wheel-metadata" in path.parts or "pip_cache" in path.parts:
        return True

    return False


def determine_safety_status(
    metadata: FileMetadata,
    python_installed: bool,
) -> str:
    """
    Determine the safety status of a file or directory.

    Returns:
        'safe', 'warning', 'danger', or 'unknown'

    Safety Logic:
    1. Check if it's a Python artifact safe to delete. (safe)
    2. Check if it's a known system path. (danger)
    3. Check if it's in a user document directory. (warning)
    4. Check if it matches known safe patterns (tmp, cache, logs). (safe)
    5. Otherwise, return 'unknown'.
    """
    path = metadata.path
    path_str = str(path).lower()

    # 1. Python package artifacts
    if is_python_pkg_safe_to_delete(metadata, python_installed):
        return "safe"

    # 2. System paths are dangerous
    for sys_path in SYSTEM_PATHS:
        if sys_path.lower() in path_str:
            return "danger"

    # 3. User documents need review
    for doc_path in USER_DOCUMENT_PATHS:
        if doc_path.lower() in path_str:
            return "warning"

    # 4. Known safe temp/cache locations
    for pattern in SAFE_PATTERNS:
        if pattern in path_str:
            return "safe"

    return "unknown"
