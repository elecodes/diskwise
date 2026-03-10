import sys
from pathlib import Path
import os
import shutil

# Add project root to path
sys.path.append(str(Path(__file__).parent.parent))

from diskwise.core.rules import determine_safety_status, get_advice
from diskwise.core.models import FileMetadata

def test_new_rules():
    print("Testing Cookie and Hidden File Rules...")
    
    # Test hidden file
    hidden_file = FileMetadata(path=Path("/tmp/.DS_Store"), name=".DS_Store", size=1024, is_dir=False, children_count=None)
    status = determine_safety_status(hidden_file, True)
    advice = get_advice(hidden_file)
    print(f"File: .DS_Store | Status: {status} | Advice: {advice}")
    assert status == "safe"
    assert "hidden system file" in advice.lower()

    # Test cookie file
    cookie_file = FileMetadata(path=Path("/home/user/Library/Application Support/Google/Chrome/Default/Cookies"), name="Cookies", size=512000, is_dir=False, children_count=None)
    status = determine_safety_status(cookie_file, True)
    advice = get_advice(cookie_file)
    print(f"File: Cookies | Status: {status} | Advice: {advice}")
    assert status == "safe"
    assert "browser data" in advice.lower()

    # Test normal file
    normal_file = FileMetadata(path=Path("/home/user/my_important_doc.pdf"), name="my_important_doc.pdf", size=1048576, is_dir=False, children_count=None)
    status = determine_safety_status(normal_file, True)
    advice = get_advice(normal_file)
    print(f"File: my_important_doc.pdf | Status: {status} | Advice: {advice}")
    assert status == "unknown"
    assert advice == ""

    print("All tests passed!")

if __name__ == "__main__":
    test_new_rules()
