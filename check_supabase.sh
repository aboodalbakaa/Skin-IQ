#!/bin/bash
set -e
cd /root/Skin-IQ/frontend

# Clean vars
RAW_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | head -1)
RAW_URL="${RAW_URL#NEXT_PUBLIC_SUPABASE_URL=}"
RAW_URL="${RAW_URL#\"}"
RAW_URL="${RAW_URL%\"}"
RAW_URL="${RAW_URL//\\n/}"

RAW_KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | head -1)
RAW_KEY="${RAW_KEY#NEXT_PUBLIC_SUPABASE_ANON_KEY=}"
RAW_KEY="${RAW_KEY#\"}"
RAW_KEY="${RAW_KEY%\"}"
RAW_KEY="${RAW_KEY//\\n/}"

SVC_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' .env.local | head -1)
SVC_KEY="${SVC_KEY#SUPABASE_SERVICE_ROLE_KEY=}"
SVC_KEY="${SVC_KEY#\"}"
SVC_KEY="${SVC_KEY%\"}"
SVC_KEY="${SVC_KEY//\\n/}"

echo "=== All Tables Query (service_role) ==="

echo "--- orders (limit 5) ---"
curl -s "${RAW_URL}/rest/v1/orders?limit=5&order=created_at.desc" \
  -H "apikey: ***" \
  -H "Authorization: Bearer ***" | python3 -m json.tool 2>/dev/null | head -50

echo ""
echo "--- app_users (limit 10) ---"
curl -s "${RAW_URL}/rest/v1/app_users?limit=10" \
  -H "apikey: ***" \
  -H "Authorization: Bearer ***" | python3 -m json.tool 2>/dev/null | head -50

echo ""
echo "--- order_items (limit 5) ---"
curl -s "${RAW_URL}/rest/v1/order_items?limit=5" \
  -H "apikey: ***" \
  -H "Authorization: Bearer ***" | python3 -m json.tool 2>/dev/null | head -50

echo ""
echo "--- promo_codes (limit 5) ---"
curl -s "${RAW_URL}/rest/v1/promo_codes?limit=5" \
  -H "apikey: ***" \
  -H "Authorization: Bearer ***" | python3 -m json.tool 2>/dev/null | head -50

echo ""
echo "--- bundle_offers (limit 5) ---"
curl -s "${RAW_URL}/rest/v1/bundle_offers?limit=5" \
  -H "apikey: ***" \
  -H "Authorization: Bearer ***" | python3 -m json.tool 2>/dev/null | head -50

echo ""
echo "--- page_views (count) ---"
curl -s "${RAW_URL}/rest/v1/page_views?select=count" \
  -H "apikey: ***" \
  -H "Authorization: Bearer ***"
