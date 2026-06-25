#!/bin/bash
# 卸载 D4-D30 每日定时任务

set -e

EXISTING=$(crontab -l 2>/dev/null || echo "")

if ! echo "$EXISTING" | grep -q "daily-push.sh"; then
  echo "ℹ️  没有 daily-push 任务"
  exit 0
fi

# 移除含 daily-push 的行
NEW=$(echo "$EXISTING" | grep -v "daily-push" | grep -v "30 天实验" | grep -v "^# ===")

echo "$NEW" | crontab -

echo "✅ 定时任务已卸载"
echo ""
echo "📋 当前 crontab："
crontab -l 2>/dev/null || echo "（空）"