import requests
import os

BASE_URL = "http://localhost:8000/api"

def test_compress():
    # Create a dummy file in Downloads
    test_file = os.path.expanduser("~/Downloads/test_compress.txt")
    with open(test_file, "w") as f:
        f.write("test compression")
    
    print(f"Created test file: {test_file}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/compress",
            json={"paths": [test_file]}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data["status"] == "success":
                archive = data["compressed"][0]["archive"]
                if os.path.exists(archive):
                    print(f"SUCCESS: Archive created at {archive}")
                else:
                    print(f"FAILURE: Archive reported but not found at {archive}")
            else:
                print(f"FAILURE: Backend reported failure: {data.get('errors')}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_compress()
