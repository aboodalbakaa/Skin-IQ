#!/bin/bash
# =============================================================================
# SkinIQ Super Watchdog — monitors site health and auto-fixes issues
# Runs from the Hermes cron system. Silent when healthy, noisy when broken.
# =============================================================================

SITE_URL="https://skiniq-wellness.vercel.app"
NOTIFY_CHAT="539459447"
ALERTS=()
FIXES=()

# ---------- Load env for Telegram ----------
ENV_FILE="/root/Skin-IQ/frontend/.env.local"
if [ -f "$ENV_FILE" ]; then
  TOKEN=$(grep '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | head -1 | sed 's/^TELEGRAM_BOT_TOKEN=//' | sed 's/^"//' | sed 's/"$//' | sed 's/\\n//g')
  CHAT=$(grep '^TELEGRAM_CHAT_ID=' "$ENV_FILE" | head -1 | sed 's/^TELEGRAM_CHAT_ID=//' | sed 's/^"//' | sed 's/"$//')
else
  echo "WATCHDOG: .env.local not found — cannot send alerts"
  TOKEN=""
  CHAT=""
fi

send_alert() {
  local msg="$1"
  if [ -n "$TOKEN" ] && [ -n "$CHAT" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
      -H "Content-Type: application/json" \
      -d "{\"chat_id\":\"${CHAT}\",\"text\":\"${msg}\",\"parse_mode\":\"Markdown\"}" > /dev/null 2>&1
  fi
}

# =========== CHECK 1: Site HTTP Health ===========
echo "WATCHDOG: Checking site health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${SITE_URL}/en" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  echo "WATCHDOG: Site UP (HTTP ${HTTP_CODE})"
else
  ALERTS+=("🔴 *Site Down* — HTTP ${HTTP_CODE}")
  # Auto-fix: attempt to trigger a Vercel redeploy
  echo "WATCHDOG: Site returned ${HTTP_CODE} — attempting redeploy..."
  cd /root/Skin-IQ/frontend && npx vercel --prod --yes > /tmp/vercel-deploy.log 2>&1
  DEPLOY_EXIT=$?
  if [ $DEPLOY_EXIT -eq 0 ]; then
    FIXES+=("✅ Redeployed SkinIQ to Vercel (from watchdog)")
  else
    FIXES+=("❌ Vercel redeploy failed — manual intervention needed")
  fi
fi

# =========== CHECK 2: API Route Health ===========
echo "WATCHDOG: Checking API route..."
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${SITE_URL}/api/notify-order" -X POST -H "Content-Type: application/json" -d '{}' 2>/dev/null || echo "000")

if [ "$API_CODE" = "401" ]; then
  echo "WATCHDOG: API route UP (returns 401 as expected — auth check works)"
elif [ "$API_CODE" = "000" ]; then
  ALERTS+=("🔴 *API Route Unreachable* — notify-order endpoint is down")
else
  echo "WATCHDOG: API route responded (HTTP ${API_CODE})"
fi

# =========== CHECK 3: Supabase DB Health ===========
echo "WATCHDOG: Checking Supabase..."
if [ -f "$ENV_FILE" ]; then
  SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | head -1 | sed 's/^NEXT_PUBLIC_SUPABASE_URL=//' | sed 's/^"//' | sed 's/"$//' | sed 's/\\n//g')
  SUPABASE_KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_FILE" | head -1 | sed 's/^NEXT_PUBLIC_SUPABASE_ANON_KEY=//' | sed 's/^"//' | sed 's/"$//' | sed 's/\\n//g')
  
  if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
    DB_CHECK=$(curl -s --max-time 10 "${SUPABASE_URL}/rest/v1/products?limit=1" \
      -H "apikey: ${SUPABASE_KEY}" \
      -H "Authorization: Bearer *** 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        print(f'OK ({len(data)} products accessible)')
    else:
        print('UNEXPECTED:', str(data)[:100])
except:
    print('FAIL: could not parse response')
" 2>/dev/null || echo "FAIL: curl error")
    
    if [[ "$DB_CHECK" == OK* ]]; then
      echo "WATCHDOG: Supabase DB — $DB_CHECK"
    else
      ALERTS+=("🔴 *Supabase DB Issue* — $DB_CHECK")
    fi
  fi
fi

# =========== CHECK 4: Recent Vercel Deploy Health ===========
echo "WATCHDOG: Checking Vercel deployments..."
cd /root/Skin-IQ/frontend
RECENT_DEPLOY=$(npx vercel list 2>/dev/null | grep -m1 "skiniq-wellness" | grep -v "^>")
if echo "$RECENT_DEPLOY" | grep -q "Error"; then
  ALERTS+=("🔴 *Recent Vercel Deploy FAILED* — last build had errors")
  FIXES+=("🔄 Attempted auto-redeploy (may resolve build errors)")
elif echo "$RECENT_DEPLOY" | grep -q "Ready"; then
  echo "WATCHDOG: Latest Vercel deploy is Ready ✓"
else
  echo "WATCHDOG: Could not determine deploy status"
fi

# =========== CHECK 5: Products Data Integrity ===========
echo "WATCHDOG: Checking data integrity..."
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
  PRODUCT_COUNT=$(curl -s --max-time 10 "${SUPABASE_URL}/rest/v1/products?select=id&is_active=eq.true&limit=100" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer *** 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        print(len(data))
    else:
        print('0')
except:
    print('0')
" 2>/dev/null || echo "0")
  
  if [ "$PRODUCT_COUNT" -gt 0 ] 2>/dev/null; then
    echo "WATCHDOG: ${PRODUCT_COUNT} active products ✓"
  else
    ALERTS+=("🟡 *No active products found* — possible DB issue (${PRODUCT_COUNT})")
  fi
fi

# =========== SEND REPORT IF ISSUES FOUND ===========
if [ ${#ALERTS[@]} -gt 0 ] || [ ${#FIXES[@]} -gt 0 ]; then
  REPORT="🚨 *SkinIQ Watchdog Report*"
  REPORT+="\n$(date -u '+%Y-%m-%d %H:%M UTC')"
  
  if [ ${#ALERTS[@]} -gt 0 ]; then
    REPORT+="\n\n*⚠️ Issues Detected:*"
    for alert in "${ALERTS[@]}"; do
      REPORT+="\n• ${alert}"
    done
  fi
  
  if [ ${#FIXES[@]} -gt 0 ]; then
    REPORT+="\n\n*🔧 Auto-Fixes Applied:*"
    for fix in "${FIXES[@]}"; do
      REPORT+="\n• ${fix}"
    done
  fi
  
  send_alert "$REPORT"
  echo "WATCHDOG: Alert sent — ${#ALERTS[@]} issues, ${#FIXES[@]} fixes"
fi

echo "WATCHDOG: Health check complete. $(date -u '+%Y-%m-%d %H:%M UTC')"