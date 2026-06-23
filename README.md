# XHS Media Content · 自媒体起号工作台

> 把"想做自媒体"变成"按天发布"。
> 整合 2 份完整方案 + 9 套提示词 + 30 天可勾选日历 + 可执行内容包。

---

## 📁 项目结构

```
xhs-media-content/
├── index.html              # 主页（总览 + 4 个入口）
├── strategy.html           # 通用内容策略方案（6 步方法论）
├── playbook.html           # AI 电商 30 天起号方案
├── prompts.html            # AI 提示词库（9 套可复制）
├── calendar.html           # 30 天日历（可勾选 / 进度条）
│
├── assets/
│   ├── css/main.css        # 统一样式
│   ├── js/app.js           # 复制 / 弹窗 / 进度 / 搜索
│   ├── avatar.png          # 头像
│   └── bg.png              # 背景
│
└── content-kit/            # ⭐ 可执行内容包（拖进 Notion/飞书/Obsidian 即用）
    ├── README.md           # 包说明
    ├── 选题库.md           # 100+ 选题（通用 + AI 电商）
    ├── 30天日历.csv        # 28 天日历（直接导入 Notion/Excel）
    ├── 提示词库.md         # 9 套提示词 Markdown 备份
    ├── 行动清单.md         # Week 0-12 任务打卡
    └── 模板检查表.md       # AI 文案发布前 4 项 fact-check
```

---

## 🚀 快速开始

### 方式 1：直接打开（最简单）

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

> 无需安装任何依赖，纯静态 HTML，所有数据保存在浏览器 localStorage。

### 方式 2：本地启服务（推荐）

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .

# 然后访问 http://localhost:8080
```

### 方式 3：部署到线上

可以直接部署到：
- Vercel：`vercel --prod`
- Netlify：拖拽整个文件夹到 netlify.com/drop
- GitHub Pages：push 到仓库，Settings → Pages → 选 main 分支
- Cloudflare Pages：连接 GitHub 仓库自动部署

---

## 🎯 4 个核心入口

| 入口 | 链接 | 用途 |
|------|------|------|
| ① 主页 | `index.html` | 总览 + 4 个入口卡片 + 数据展示 |
| ② 策略方案 | `strategy.html` | 选赛道 / 内容支柱 / 平台差异 / AI SOP / 90 天日历 / 行动清单 |
| ③ 30 天起号 | `playbook.html` | AI 电商垂类完整方案：自我定位 / 主页包装 / 7 天脚本 / 30 天日历 / 关键词 / 验证目标 |
| ④ 提示词库 | `prompts.html` | 9 套提示词模板（带复制按钮） |
| ⑤ 30 天日历 | `calendar.html` | 交互式日历：可勾选、可看详情、进度条 |

---

## 📦 content-kit/ 内容包使用

### 场景 A：导入 Notion

1. 打开 Notion → 新建页面
2. 把 `选题库.md` / `提示词库.md` / `行动清单.md` 直接粘贴（Notion 自动渲染 Markdown）
3. `30天日历.csv` → Notion 新建 Table → 粘贴数据

### 场景 B：导入飞书多维表格

1. 飞书 → 新建"多维表格"
2. 导入 `30天日历.csv` → 选 CSV 导入
3. 添加视图（按周/按平台/按类型分组）

### 场景 C：导入 Obsidian / VS Code

1. 直接打开 .md 文件即可
2. 用 Markdown 预览 / TOC 插件

### 场景 D：纯文本编辑器

1. 所有 .md 文件用任何编辑器打开都能读
2. `30天日历.csv` 用 Excel / Numbers / WPS 打开

---

## ✨ 核心功能

### 1. 一键复制（提示词库）

所有提示词代码块右上角都有「复制」按钮：
- 点击即复制到剪贴板
- 已复制后变绿色「✓ 已复制」
- 1.8 秒后恢复

### 2. 日历打勾（30 天日历）

- **单击**：弹出详情（标题/类型/标签/完整脚本/封面建议）
- **双击**：标记为已完成（绿色 ✓）
- **进度条**：实时显示完成度
- **持久化**：自动保存到 localStorage，关闭浏览器不丢
- **复制文案**：弹窗内可一键复制完整脚本

### 3. 搜索（提示词库）

- 顶部搜索框输入关键词
- 自动过滤匹配的提示词卡片

### 4. 折叠/展开（策略方案）

- 各平台详细策略用 `<details>` 折叠
- 点击展开/收起，不占屏幕

---

## 🛠️ 技术栈

- **HTML5** 语义化标签
- **CSS3** 自定义属性（CSS Variables）+ Grid + Flex
- **原生 JS**（无依赖、零打包）
- **localStorage** 进度持久化
- **无构建步骤**：修改文件直接刷新即可

---

## 📝 扩展建议

### 替换内容
所有内容都在 HTML 里直接写，搜 `</body>` 之前的部分，找到对应内容改即可。

### 换主题色
改 `assets/css/main.css` 顶部 `:root` 里的变量：
```css
--primary: #ff2442;    /* 主色 */
--secondary: #0f766e;  /* 副色 */
--accent: #f59e0b;     /* 强调色 */
```

### 加新提示词
复制 `<div class="prompt-card search-item">` 整块，按格式补一个即可。

### 加新日历日
复制 `<div class="cal-day" data-day="D29" ...>` 整块，补上数据。

---

## 📜 原始素材

- 《内容策略规划方案》- 通用自媒体方法论
- 《起号大礼包_AI电商内容账号》- AI 电商垂类 30 天落地方案

两份原始 `.md` / `.html` 仍在项目根目录，作为工作台的数据源。

---

## 📄 许可

仅供个人学习使用。商业转载请联系作者。

---

> 💡 **记住：** 开始比完美更重要。打开 `calendar.html`，先做 Day 1。
