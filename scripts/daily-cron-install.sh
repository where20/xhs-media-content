#!/bin/bash
# 安装 D4-D30 每日定时任务
# - 每天 19:00（你准备发笔记前一小时）推送当天状态
# - 周末复盘日 09:00 多推一次
# - 写入 ~/Library/Logs/xhs-daily.log

set -e

PROJECT_DIR="/Users/xiaoan/Desktop/WorkSpace/anan0616/xhs-media-content"
PUSH_SCRIPT="$PROJECT_DIR/scripts/daily-push.sh"
LOG_DIR="$HOME/Library/Logs"
LOG_FILE="$LOG_DIR/xhs-daily.log"

mkdir -p "$LOG_DIR"

# 读取现有 crontab（如果有）
EXISTING=$(crontab -l 2>/dev/null || echo "")

# 防止重复添加
if echo "$EXISTING" | grep -q "daily-push.sh"; then
  echo "⚠️  已有 daily-push 任务，先卸载再装："
  echo "    bash $PROJECT_DIR/scripts/daily-cron-uninstall.sh"
  exit 1
fi

# 新增任务
NEW_JOBS=$(cat <<EOF

# === 前端转AI电商 30 天实验 · 每日提醒 ===
# 每天 19:00 推"今天该发什么"
0 19 * * * /bin/bash $PUSH_SCRIPT >> $LOG_FILE 2>&1
# 周末复盘日 09:00 多推一次（让你周末有空写）
0 9 * * 0 /bin/bash $PUSH_SCRIPT >> $LOG_FILE 2>&1
EOF
)

# 合并 + 安装
(echo "$EXISTING"; echo "$NEW_JOBS") | crontab -

echo "✅ 定时任务已安装"
echo ""
echo "📅 任务清单："
crontab -l | grep -A 1 "30 天实验" | grep -v "^--$"
echo ""
echo "📋 日志位置：$LOG_FILE"
echo "💡 立即测试：bash $PUSH_SCRIPT"
echo "💡 卸载：bash $PROJECT_DIR/scripts/daily-cron-uninstall.sh"