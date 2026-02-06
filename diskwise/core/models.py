"""
Core domain models for diskwise.

This module contains pure data structures used across the application.
No I/O operations, no external dependencies.
"""

from collections import namedtuple
from pathlib import Path


FileMetadata = namedtuple(
    "FileMetadata",
    [
        "path",  # Path: Absolute path to the file/directory
        "name",  # str: Filename or directory name
        "size",  # int: Size in bytes (0 for directories if not calculated)
    ],
)
