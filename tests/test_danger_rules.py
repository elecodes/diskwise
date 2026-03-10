import sys
from pathlib import Path

# Add project root and diskwise to sys.path to handle local imports
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))
sys.path.append(str(project_root / "diskwise"))

try:
    from core.models import FileMetadata
    from core.rules import determine_safety_status, get_advice
except ImportError:
    from diskwise.core.models import FileMetadata
    from diskwise.core.rules import determine_safety_status, get_advice

def test_danger_rules():
    print("Testing Danger Rules...")
    test_cases = [
        # Path, Expected Status
        ("/Users/user/.ssh/id_rsa", "danger"),
        ("/Users/user/.ssh/id_rsa.pub", "danger"),
        ("/Users/user/.aws/credentials", "danger"),
        ("/Users/user/Documents/secret.key", "danger"),
        ("/Users/user/Downloads/cert.pem", "danger"),
        ("/Users/user/project/node_modules", "safe"),
        ("/Users/user/project/node_modules/lodash/package.json", "safe"),
        ("/Users/user/Downloads/movie.mp4", "warning"),
        ("/Users/user/AppData/Local/Temp/tempfile.tmp", "safe"),
    ]

    for path_str, expected in test_cases:
        path = Path(path_str)
        metadata = FileMetadata(
            path=path,
            name=path.name,
            size=1024,
            is_dir=False,
            children_count=None
        )
        status = determine_safety_status(metadata, python_installed=True)
        advice = get_advice(metadata)
        
        print(f"Path: {path_str}")
        print(f"  Expected: {expected}, Actual: {status}")
        print(f"  Advice: {advice}")
        
        assert status == expected, f"Failed for {path_str}: expected {expected}, got {status}"
    
    print("\nAll tests passed!")

if __name__ == "__main__":
    try:
        test_danger_rules()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
