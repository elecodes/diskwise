import pytest
from pathlib import Path
from core.models import FileMetadata
from core.rules import determine_safety_status, get_advice

def test_cookie_rules_identification():
    # Test persistent cookie/data patterns
    cookies_file = FileMetadata(
        path=Path("/Users/test/Library/Application Support/Google/Chrome/Default/Cookies"),
        name="Cookies",
        size=1024,
        is_dir=False,
        children_count=None
    )
    assert determine_safety_status(cookies_file, python_installed=True) == "safe"
    advice = get_advice(cookies_file)
    assert "persistent browser data" in advice
    assert "sign you out" in advice

def test_browser_cache_rules():
    # Test browser cache patterns
    cache_dir = FileMetadata(
        path=Path("/Users/test/Library/Caches/Google/Chrome/Default/Cache"),
        name="Cache",
        size=5000000,
        is_dir=True,
        children_count=100
    )
    assert determine_safety_status(cache_dir, python_installed=True) == "safe"
    advice = get_advice(cache_dir)
    assert "browser cache" in advice
    assert "safe to delete" in advice
    assert "without affecting your logins" in advice

def test_new_browser_patterns():
    # Test newly added browser patterns
    gpu_cache = FileMetadata(
        path=Path("/Users/test/Library/Application Support/Chrome/GPUCache"),
        name="GPUCache",
        size=1024,
        is_dir=True,
        children_count=10
    )
    assert determine_safety_status(gpu_cache, python_installed=True) == "safe"
    advice = get_advice(gpu_cache)
    assert "browser cache" in advice

    indexed_db = FileMetadata(
        path=Path("/Users/test/Library/Application Support/Chrome/IndexedDB"),
        name="IndexedDB",
        size=1024,
        is_dir=True,
        children_count=5
    )
    assert determine_safety_status(indexed_db, python_installed=True) == "safe"
    advice = get_advice(indexed_db)
    assert "persistent browser data" in advice
