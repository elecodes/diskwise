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

# Browser cookie and cache patterns (common locations/filenames)
BROWSER_COOKIE_PATTERNS: Set[str] = {
    "Cookies",
    "Cookies-journal",
    "Web Data",
    "Web Data-journal",
    "Local Storage",
    "Session Storage",
    "Network Action Predictor",
    "Cache",
    "Code Cache",
    "GPUCache",
    "IndexedDB",
    "Service Worker",
    "VideoDecodeStats",
}

# Hidden system files that are generally safe to delete
HIDDEN_SYSTEM_FILES: Set[str] = {
    ".DS_Store",
    ".localized",
    "Thumbs.db",
    "desktop.ini",
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

# Sensitive user patterns that are dangerous to delete (security keys, etc.)
DANGER_PATTERNS: Set[str] = {
    ".ssh",
    ".gnupg",
    ".aws",
    ".kube",
    ".docker",
    "Library/Keychains",
}

# Sensitive file extensions
DANGER_EXTENSIONS: Set[str] = {
    ".key",
    ".pem",
    ".pub",
    ".asc",
}

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
        if path_str.startswith(sys_path.lower()):
            return "danger"

    # 2b. Sensitive user patterns/extensions are dangerous
    if any(p.lower() in path_str for p in DANGER_PATTERNS):
        return "danger"
    if any(metadata.name.lower().endswith(ext.lower()) for ext in DANGER_EXTENSIONS):
        return "danger"

    # 3. User documents need review
    for doc_path in USER_DOCUMENT_PATHS:
        if doc_path.lower() in path_str:
            return "warning"

    # 4. Known safe temp/cache locations (including node_modules)
    if "node_modules" in path_str:
        return "safe"
        
    for pattern in SAFE_PATTERNS:
        if pattern in path_str:
            return "safe"

    # 5. Browser cookies
    for pattern in BROWSER_COOKIE_PATTERNS:
        if pattern.lower() in path_str.lower():
            return "safe"

    # 6. Hidden system files
    if metadata.name in HIDDEN_SYSTEM_FILES:
        return "safe"

    return "unknown"


def get_advice(metadata: FileMetadata) -> str:
    """
    Provide specific advice for certain file types or paths.
    """
    name = metadata.name
    path_str = str(metadata.path).lower()

    if name in HIDDEN_SYSTEM_FILES:
        return f"This is a hidden system file ('{name}') used for folder preferences. It is safe to delete, but will be recreated by the OS."

    for pattern in BROWSER_COOKIE_PATTERNS:
        if pattern.lower() in path_str:
            if "cache" in pattern.lower():
                return f"This appears to be browser cache ('{pattern}'). It is safe to delete and will free up space without affecting your logins."
            return "This appears to be persistent browser data (cookies or storage). Deleting it will free space but will sign you out of websites and may clear site-specific settings."

    if ".pyc" in name or "__pycache__" in path_str:
        return "Python cache files. Safe to delete; they will be regenerated when you run your code."

    if "node_modules" in path_str:
        return "Node.js dependencies. Can be deleted and reinstalled using 'npm install'."

    if any(p.lower() in path_str for p in DANGER_PATTERNS):
        return "This is a sensitive configuration or security directory. Deleting it could break applications or access to services."

    if any(name.lower().endswith(ext.lower()) for ext in DANGER_EXTENSIONS):
        return "This appears to be a security key or certificate. Deleting it could permanently lock you out of your accounts or servers."

    return ""
