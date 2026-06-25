#!/usr/bin/env node
/**
 * D4-D30 定时任务 — 每日校验 daily-content.json
 *
 * 职责：
 * 1. 根据当前日期，计算"今天应该是 D几"
 * 2. 检查 daily-content.json 里这一天是否填好
 * 3. 输出三态：ready / draft（部分填） / empty（完全没填）
 * 4. 输出明天 + 后天的预览（提前提示）
 *
 * 设计原则：
 * - 不自动生成内容（内容生成需要判断）
 * - 只做"检查 + 提示"，触发人主动决策
 * - IM 推送由调用方决定（crontab 里可以接飞书 / 邮件 / 系统通知）
 *
 * 用法：
 *   node scripts/daily-status.mjs                # 检查"今天"
 *   node scripts/daily-status.mjs --day=5        # 检查 D5
 *   node scripts/daily-status.mjs --week         # 看本周 D4-D7 全状态
 *   node scripts/daily-status.mjs --json         # JSON 输出（给 IM bot 调用）
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const JSON_PATH = path.join(ROOT, 'content-kit', 'daily-content.json');
const CSV_PATH = path.join(ROOT, 'content-kit', '30天日历.csv');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

// ===== 工具函数 =====
function loadJson() {
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`找不到 ${JSON_PATH}`);
  }
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
}

function loadCalendar() {
  if (!fs.existsSync(CSV_PATH)) return [];
  const text = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row = {};
    headers.forEach((h, i) => row[h] = (cells[i] || '').trim());
    return row;
  });
}

function todayDayNumber() {
  // 30 天实验：2026-06-24 = D1（基准日）
  // 推算今天 = D几
  const baseDate = new Date('2026-06-24T00:00:00+08:00');
  const now = new Date();
  // 按本地"日历日"算差（避免 timezone 坑）
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const baseLocal = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const diffDays = Math.floor((todayLocal - baseLocal) / 86400000) + 1;
  return Math.max(1, Math.min(30, diffDays));
}

function dayStatus(dayData) {
  if (!dayData) return 'empty';
  if (dayData.status === 'ready' && dayData.images?.length > 0 && dayData.body?.length > 100) {
    return 'ready';
  }
  if (dayData.body && dayData.body.length > 30) return 'draft';
  return 'empty';
}

function statusEmoji(s) {
  return { ready: '✅', draft: '🟡', empty: '❌' }[s] || '❔';
}

function statusText(s) {
  return { ready: '已就绪', draft: '草稿中', empty: '待补' }[s] || '未知';
}

// ===== 主流程 =====
function dayPublishDate(dayNumber) {
  // 基准日 2026-06-24 = D1
  const base = new Date(2026, 5, 24);  // 月份从 0 开始，6月 = 5
  base.setDate(base.getDate() + (dayNumber - 1));
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return {
    date: `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`,
    weekday: weekdays[base.getDay()],
  };
}

function buildReport() {
  const data = loadJson();
  const calendar = loadCalendar();
  const today = args.day ? parseInt(args.day) : todayDayNumber();

  const dayData = data.days?.[String(today)];
  const status = dayStatus(dayData);
  const calendarEntry = calendar.find((c) => c.Day === `D${today}`);
  const computedPublish = dayPublishDate(today);

  const report = {
    today,
    status,
    title: dayData?.title || '(未填)',
    publishDate: dayData?.publishDate || computedPublish.date,
    weekday: dayData?.weekday || computedPublish.weekday,
    bodyLen: dayData?.body?.length || 0,
    imageCount: dayData?.images?.length || 0,
    calendarTopic: calendarEntry?.Topic || '(无)',
    pillar: dayData?.pillar || calendarEntry?.Type || '(无)',
  };

  // 周视图
  if (args.week) {
    const weekStart = Math.floor((today - 1) / 7) * 7 + 1;
    const weekEnd = Math.min(weekStart + 6, 30);
    report.week = [];
    for (let d = weekStart; d <= weekEnd; d++) {
      const dd = data.days?.[String(d)];
      const calEntry = calendar.find((c) => c.Day === `D${d}`);
      const pd = dayPublishDate(d);
      report.week.push({
        day: d,
        status: dayStatus(dd),
        title: dd?.title || calEntry?.Topic || '(无)',
        publishDate: dd?.publishDate || pd.date,
      });
    }
  }

  return report;
}

function printHuman(r) {
  const lines = [];
  lines.push(`${statusEmoji(r.status)} D${r.today} · ${r.title}`);
  lines.push(`   状态：${statusText(r.status)} · 字数 ${r.bodyLen} · 配图 ${r.imageCount} 张`);
  lines.push(`   发布时间：${r.publishDate} (${r.weekday})`);
  lines.push(`   主题：${r.calendarTopic}`);
  lines.push(`   Pillar：${r.pillar}`);

  if (r.status === 'empty') {
    lines.push('');
    lines.push('⚠️  这一天还没填。打开 daily.html?day=' + r.today + ' 看占位');
    lines.push('   或发命令：做 D' + r.today);
  }
  if (r.status === 'draft') {
    lines.push('');
    lines.push('🟡 这天只有部分内容。继续补完，或发命令：补 D' + r.today);
  }

  if (r.week) {
    lines.push('');
    lines.push(`📅 本周 W${Math.floor((r.today - 1) / 7) + 1} 状态：`);
    r.week.forEach((w) => {
      lines.push(`   ${statusEmoji(w.status)} D${w.day} ${w.publishDate} · ${w.title}`);
    });
  }

  console.log(lines.join('\n'));
}

// ===== 入口 =====
try {
  const report = buildReport();
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report);
  }
} catch (e) {
  console.error('❌ 错误：' + e.message);
  process.exit(1);
}