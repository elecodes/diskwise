"""
Unit tests for core/rules.py.

Tests follow the AAA pattern (Arrange-Act-Assert) and TDD principles.
All tests are isolated and use no I/O operations.
"""

from pathlib import Path

import pytest

from core.models import FileMetadata
from core.rules import is_python_pkg_safe_to_delete


class TestIsPythonPkgSafeToDelete:
    """
    Test suite for is_python_pkg_safe_to_delete function.

    This function determines if Python package artifacts can be safely
    deleted based on whether Python is installed on the system.
    """

    def test_returns_false_when_python_not_installed(self):
        """
        Arrange: Create a __pycache__ directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=False.
        Assert: Returns False (cannot reinstall without Python).
        """
        # Arrange
        pycache = FileMetadata(
            path=Path("/home/user/project/__pycache__"),
            name="__pycache__",
            size=4096,
        )

        # Act
        result = is_python_pkg_safe_to_delete(pycache, python_installed=False)

        # Assert
        assert result is False

    def test_pycache_directory_safe_when_python_installed(self):
        """
        Arrange: Create a __pycache__ directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (__pycache__ is always safe to delete).
        """
        # Arrange
        pycache = FileMetadata(
            path=Path("/home/user/project/__pycache__"),
            name="__pycache__",
            size=4096,
        )

        # Act
        result = is_python_pkg_safe_to_delete(pycache, python_installed=True)

        # Assert
        assert result is True

    def test_pytest_cache_directory_safe_when_python_installed(self):
        """
        Arrange: Create a .pytest_cache directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (.pytest_cache is safe to delete).
        """
        # Arrange
        pytest_cache = FileMetadata(
            path=Path("/home/user/project/.pytest_cache"),
            name=".pytest_cache",
            size=8192,
        )

        # Act
        result = is_python_pkg_safe_to_delete(pytest_cache, python_installed=True)

        # Assert
        assert result is True

    def test_mypy_cache_directory_safe_when_python_installed(self):
        """
        Arrange: Create a .mypy_cache directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (.mypy_cache is safe to delete).
        """
        # Arrange
        mypy_cache = FileMetadata(
            path=Path("/home/user/project/.mypy_cache"),
            name=".mypy_cache",
            size=4096,
        )

        # Act
        result = is_python_pkg_safe_to_delete(mypy_cache, python_installed=True)

        # Assert
        assert result is True

    def test_venv_directory_safe_when_python_installed(self):
        """
        Arrange: Create a venv directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (venv can be recreated).
        """
        # Arrange
        venv = FileMetadata(
            path=Path("/home/user/project/venv"),
            name="venv",
            size=1048576,
        )

        # Act
        result = is_python_pkg_safe_to_delete(venv, python_installed=True)

        # Assert
        assert result is True

    def test_pyc_file_safe_when_python_installed(self):
        """
        Arrange: Create a .pyc file metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (.pyc files are compiled cache).
        """
        # Arrange
        pyc_file = FileMetadata(
            path=Path("/home/user/project/__pycache__/module.cpython-311.pyc"),
            name="module.cpython-311.pyc",
            size=1024,
        )

        # Act
        result = is_python_pkg_safe_to_delete(pyc_file, python_installed=True)

        # Assert
        assert result is True

    def test_pyo_file_safe_when_python_installed(self):
        """
        Arrange: Create a .pyo file metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (.pyo files are optimized compiled cache).
        """
        # Arrange
        pyo_file = FileMetadata(
            path=Path("/home/user/project/module.pyo"),
            name="module.pyo",
            size=512,
        )

        # Act
        result = is_python_pkg_safe_to_delete(pyo_file, python_installed=True)

        # Assert
        assert result is True

    def test_file_in_pycache_directory_safe_when_python_installed(self):
        """
        Arrange: Create a file inside __pycache__ directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (anything in __pycache__ is safe).
        """
        # Arrange
        cached_file = FileMetadata(
            path=Path("/home/user/project/__pycache__/some_module.cpython-39.pyc"),
            name="some_module.cpython-39.pyc",
            size=2048,
        )

        # Act
        result = is_python_pkg_safe_to_delete(cached_file, python_installed=True)

        # Assert
        assert result is True

    def test_dist_directory_safe_when_python_installed(self):
        """
        Arrange: Create a dist directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (dist is build output, can be rebuilt).
        """
        # Arrange
        dist_dir = FileMetadata(
            path=Path("/home/user/project/dist"),
            name="dist",
            size=16384,
        )

        # Act
        result = is_python_pkg_safe_to_delete(dist_dir, python_installed=True)

        # Assert
        assert result is True

    def test_tox_directory_safe_when_python_installed(self):
        """
        Arrange: Create a .tox directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (.tox is test environment, can be recreated).
        """
        # Arrange
        tox_dir = FileMetadata(
            path=Path("/home/user/project/.tox"),
            name=".tox",
            size=32768,
        )

        # Act
        result = is_python_pkg_safe_to_delete(tox_dir, python_installed=True)

        # Assert
        assert result is True

    def test_regular_python_file_not_safe(self):
        """
        Arrange: Create a regular .py file metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns False (source code should not be deleted).
        """
        # Arrange
        py_file = FileMetadata(
            path=Path("/home/user/project/module.py"),
            name="module.py",
            size=1024,
        )

        # Act
        result = is_python_pkg_safe_to_delete(py_file, python_installed=True)

        # Assert
        assert result is False

    def test_regular_directory_not_safe(self):
        """
        Arrange: Create a regular directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns False (regular directories should not be deleted).
        """
        # Arrange
        regular_dir = FileMetadata(
            path=Path("/home/user/project/src"),
            name="src",
            size=4096,
        )

        # Act
        result = is_python_pkg_safe_to_delete(regular_dir, python_installed=True)

        # Assert
        assert result is False

    def test_pip_wheel_metadata_directory_safe(self):
        """
        Arrange: Create a pip-wheel-metadata directory metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (pip wheel metadata is temporary).
        """
        # Arrange
        pip_metadata = FileMetadata(
            path=Path("/home/user/project/pip-wheel-metadata"),
            name="pip-wheel-metadata",
            size=2048,
        )

        # Act
        result = is_python_pkg_safe_to_delete(pip_metadata, python_installed=True)

        # Assert
        assert result is True

    def test_so_file_safe_when_python_installed(self):
        """
        Arrange: Create a .so (shared object) file metadata.
        Act: Call is_python_pkg_safe_to_delete with python_installed=True.
        Assert: Returns True (.so files are compiled extensions, can be rebuilt).
        """
        # Arrange
        so_file = FileMetadata(
            path=Path("/home/user/project/module.cpython-311-x86_64-linux-gnu.so"),
            name="module.cpython-311-x86_64-linux-gnu.so",
            size=40960,
        )

        # Act
        result = is_python_pkg_safe_to_delete(so_file, python_installed=True)

        # Assert
        assert result is True
