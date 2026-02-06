"""
Integration tests for infra/scanner.py.
Uses unittest to verify filesystem operations in temporary directories.
"""

import unittest
import tempfile
import shutil
from pathlib import Path
import os

from infra.scanner import (
    scan_path, 
    calculate_directory_size, 
    sanitize_path, 
    is_path_allowed,
    ALLOWED_BASE_PATHS
)


class TestScannerIntegration(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_path = Path(self.test_dir)
        
        # Add test_dir to ALLOWED_BASE_PATHS temporarily for testing
        ALLOWED_BASE_PATHS.append(self.test_path)

    def tearDown(self):
        shutil.rmtree(self.test_dir)
        ALLOWED_BASE_PATHS.remove(self.test_path)

    def test_calculate_directory_size(self):
        # Arrange
        file1 = self.test_path / "file1.txt"
        file1.write_text("hello") # 5 bytes
        
        subdir = self.test_path / "subdir"
        subdir.mkdir()
        file2 = subdir / "file2.txt"
        file2.write_text("world!") # 6 bytes
        
        # Act
        size = calculate_directory_size(self.test_path)
        
        # Assert
        self.assertEqual(size, 11)

    def test_scan_path(self):
        # Arrange
        (self.test_path / "file1.txt").write_text("x")
        (self.test_path / "subdir").mkdir()
        (self.test_path / "subdir" / "file2.txt").write_text("y")
        
        # Act
        results = list(scan_path(self.test_path, max_depth=2))
        
        # Assert
        names = [m.name for m in results]
        self.assertIn("file1.txt", names)
        self.assertIn("subdir", names)
        self.assertIn("file2.txt", names)
        self.assertEqual(len(results), 3)

    def test_sanitize_path_allows_valid(self):
        # Act
        path = sanitize_path(self.test_dir)
        
        # Assert
        self.assertEqual(path.resolve(), self.test_path.resolve())

    def test_sanitize_path_blocks_outside(self):
        # Use a path definitely outside allowed roots
        outside_path = "/usr/local/bin" # Should not be in ALLOWED_BASE_PATHS by default
        
        # Act & Assert
        with self.assertRaises(ValueError):
            sanitize_path(outside_path)

    def test_is_path_allowed(self):
        self.assertTrue(is_path_allowed(self.test_path))
        self.assertFalse(is_path_allowed(Path("/usr/local")))


if __name__ == "__main__":
    unittest.main()
