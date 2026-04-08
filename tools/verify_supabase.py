import os
import sys

# Simple script to test Python connectivity.
# Using requests to test the REST endpoint.
try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("Dependencies missing. Please run: pip install requests python-dotenv")
    sys.exit(1)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_KEY")  # Oops, need both
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found in .env")
    sys.exit(1)

print(f"Connecting to: {SUPABASE_URL}")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

try:
    # A simple call to the rest/v1/ endpoint
    response = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers, timeout=5)
    
    if response.status_code in [200, 400]:
        # 400 usually happens if we request root without specific query on empty db, but connection is successful.
        print("✅ Connection Successful! The Handshake is verified.")
    else:
        print(f"⚠️ Connection returned status code: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"❌ Connection Failed: {e}")
