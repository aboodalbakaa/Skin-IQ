import os
import sys
import json
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found in .env")
    sys.exit(1)

def create_product(name, description, retail_price, wholesale_price, is_active=True):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    payload = {
        "name": name,
        "description": description,
        "retail_price": retail_price,
        "wholesale_price": wholesale_price,
        "is_active": is_active
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/products",
        headers=headers,
        json=payload
    )
    
    if response.status_code in [200, 201]:
        print("✅ Product Created Successfully:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    else:
        print(f"❌ Failed to create product. Status: {response.status_code}")
        print(response.text)
        return None

if __name__ == "__main__":
    print("Creating testing product...")
    create_product(
        name="Wellness Tea",
        description="Relaxing night-time tea.",
        retail_price=10.00,
        wholesale_price=6.00
    )
