#!/bin/bash
cd /root/Skin-IQ/frontend

# Extract the token
RAW_TOKEN=$(grep TELEGRAM_BOT_TOKEN .env.local | head -1 | sed 's/^TELEGRAM_BOT_TOKEN=//' | sed 's/^"//' | sed 's/"$//' | sed 's/\\n//g')
RAW_CHAT=$(grep TELEGRAM_CHAT_ID .env.local | head -1 | sed 's/^TELEGRAM_CHAT_ID=//' | sed 's/^"//' | sed 's/"$//')

echo "Testing sendMessage to chat $RAW_CHAT..."
curl -s -X POST "https://api.telegram.org/bot${RAW_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${RAW_CHAT}\",\"text\":\"🔧 SkinIQ Watchdog Test - Notification system check\",\"parse_mode\":\"Markdown\"}"
echo ""
