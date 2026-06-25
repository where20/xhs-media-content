#!/bin/bash
# D4-D30 每日提醒脚本
# - 调用 daily-status.mjs 拿今天状态
# - 用 macOS 系统通知推送给你
# - 如果是 empty/draft，提示你"做 D几"
#
# 用法：bash scripts/daily-push.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 拿 JSON 输出
REPORT_JSON=$(node scripts/daily-status.mjs --json)
TODAY=$(echo "$REPORT_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).today))')
STATUS=$(echo "$REPORT_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).status))')
TITLE=$(echo "$REPORT_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).title))')
PUBLISH=$(echo "$REPORT_JSON" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).publishDate))')

# 状态 emoji 和文案
case "$STATUS" in
  ready)
    EMOJI="✅"
    HEAD="D${TODAY} 已就绪 — 今晚 ${PUBLISH} 发"
    BODY="${TITLE}"
    ;;
  draft)
    EMOJI="🟡"
    HEAD="D${TODAY} 草稿待补 — 今晚 ${PUBLISH} 发"
    BODY="${TITLE} — 打开 daily.html?day=${TODAY} 补完"
    ;;
  empty)
    EMOJI="❌"
    HEAD="D${TODAY} 还没填！今晚 ${PUBLISH} 必须发"
    BODY="${TITLE} — 发命令: 做 D${TODAY}"
    ;;
  *)
    EMOJI="❔"
    HEAD="D${TODAY} 状态未知"
    BODY="${TITLE}"
    ;;
esac

# 打印到 stdout（crontab 会记到日志）
echo "$EMOJI $HEAD"
echo "   $BODY"

# 推送 macOS 系统通知
osascript -e "display notification \"$BODY\" with title \"$HEAD\" subtitle \"前端转AI电商 30天\" sound name \"Submarine\"" 2>/dev/null || true

# 如果是 empty/draft，同时写一个待办标记到桌面（可视化提醒）
if [ "$STATUS" != "ready" ]; then
  MARKER="/Users/xiaoan/Desktop/xhs-doing-D${TODAY}.txt"
  echo "D${TODAY} 待补 · ${PUBLISH} · ${TITLE}" > "$MARKER" 2>/dev/null || true
fi
