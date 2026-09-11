#!/bin/bash

CHROME_BIN="$HOME/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"

if [ ! -f "$CHROME_BIN" ]; then
  CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
fi

echo "🚀 กำลังเปิด Chrome พร้อม Remote Debugging Port 9222..."
"$CHROME_BIN" --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-dev" http://localhost:3010/ &
echo "✅ Chrome เปิดสำเร็จแล้วบนพอร์ต 9222 (http://localhost:3010)"
