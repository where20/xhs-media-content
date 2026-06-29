/* ==========================================================================
   XHS Media Content · 交互脚本
   1. 一键复制（提示词/清单）
   2. 日历打勾（localStorage 持久化）
   3. 日历点击弹详情
   4. 简单搜索过滤
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 1. 复制按钮 ---------- */
  document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('copy-btn')) return;
    const btn = e.target;
    const pre = btn.closest('pre');
    if (!pre) return;
    const code = pre.querySelector('code') || pre;
    const text = code.innerText;

    const done = () => {
      const old = btn.innerText;
      btn.innerText = '已复制 ✓';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerText = old;
        btn.classList.remove('copied');
      }, 1800);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  });

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { console.error(e); }
    document.body.removeChild(ta);
  }

  /* 给所有 pre 自动加复制按钮 */
  document.querySelectorAll('pre').forEach(function (pre) {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.innerText = '复制';
    pre.appendChild(btn);
  });

  /* ---------- 2. 日历打勾（仅在 #calendar 容器内） ---------- */
  const STORAGE_KEY = 'xhs-content-completed-days';
  function getCompleted() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveCompleted(map) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch (e) {}
  }
  function renderCompleted() {
    const map = getCompleted();
    document.querySelectorAll('.cal-day').forEach(function (day) {
      const id = day.getAttribute('data-day');
      if (map[id]) day.classList.add('completed');
      else day.classList.remove('completed');
    });
    updateProgress();
  }
  function toggleDay(id) {
    const map = getCompleted();
    if (map[id]) delete map[id]; else map[id] = Date.now();
    saveCompleted(map);
    renderCompleted();
  }
  function updateProgress() {
    const total = document.querySelectorAll('.cal-day').length;
    const done = Object.keys(getCompleted()).length;
    const bar = document.getElementById('progress-bar');
    const count = document.getElementById('progress-count');
    if (bar) bar.style.width = (total ? (done / total * 100) : 0) + '%';
    if (count) count.innerText = done + ' / ' + total;
  }
  document.addEventListener('click', function (e) {
    const day = e.target.closest('.cal-day');
    if (!day) return;
    /* 中键 / Ctrl 点击 = 切换完成；普通点击 = 弹详情 */
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      toggleDay(day.getAttribute('data-day'));
      return;
    }
    showDayModal(day);
  });
  document.addEventListener('dblclick', function (e) {
    const day = e.target.closest('.cal-day');
    if (!day) return;
    e.preventDefault();
    toggleDay(day.getAttribute('data-day'));
  });

  /* ---------- 3. 日历详情弹窗 ---------- */
  const modalHTML = `
    <div class="modal-backdrop" id="dayModal" role="dialog" aria-modal="true">
      <div class="modal">
        <button class="modal-close" type="button" aria-label="关闭">×</button>
        <div id="dayModalBody"></div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('dayModal');
  const modalBody = document.getElementById('dayModalBody');
  document.addEventListener('click', function (e) {
    if (e.target === modal || e.target.classList.contains('modal-close')) {
      modal.classList.remove('open');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') modal.classList.remove('open');
  });
  function showDayModal(day) {
    const title = day.getAttribute('data-title') || '';
    const dayNum = day.getAttribute('data-day') || '';
    const content = day.getAttribute('data-content') || '';
    const type = day.getAttribute('data-type') || '';
    const tags = (day.getAttribute('data-tags') || '').split('|').filter(Boolean);
    const tip = day.getAttribute('data-tip') || '';
    const id = day.getAttribute('data-day');

    const dateText = window.__xhs_day_dates && window.__xhs_day_dates[dayNum] ? window.__xhs_day_dates[dayNum] : '';
    let html = `<div class="day-label" style="font-size:12px; color:var(--text-faint); font-weight:700; letter-spacing:1px; text-transform:uppercase;">${escapeHTML(dayNum)} · ${escapeHTML(type)}${dateText ? ' · ' + escapeHTML(dateText) : ''}</div>`;
    html += `<h2>${escapeHTML(title)}</h2>`;
    if (tags.length) {
      html += '<div class="mb-2">' + tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('') + '</div>';
    }
    if (content) {
      html += '<div>';
      content.split('\n').filter(Boolean).forEach(p => {
        html += `<div class="part">${formatInline(p)}</div>`;
      });
      html += '</div>';
    }
    if (tip) {
      html += `<div class="callout info mt-2"><strong>封面建议：</strong>${escapeHTML(tip)}</div>`;
    }
    /* 检测详情页是否存在（D1-D6 已生成，后续待补） */
    const dayPage = dayNum && /^D\d+$/.test(dayNum) ? dayNum + '.html' : null;
    let pageBtn = '';
    if (dayPage) {
      /* 用 HEAD 探测，但避免真的发请求：直接读页面里有没有配置好的硬编码清单 */
      const exists = window.__xhs_day_pages && window.__xhs_day_pages[dayNum];
      pageBtn = exists
        ? `<a class="btn btn-primary" href="${dayPage}" style="text-decoration:none; display:inline-flex; align-items:center;">📄 打开 ${dayNum} 详情页</a>`
        : `<button class="btn" type="button" disabled title="详情页待生成" style="opacity:.55; cursor:not-allowed;">📄 详情页待生成</button>`;
    }
    html += `<div class="mt-3" style="display:flex; gap:8px; flex-wrap:wrap;">
      <button class="btn btn-primary" id="modalToggle" type="button">${getCompleted()[id] ? '✓ 已完成（点击取消）' : '标记为已完成'}</button>
      <button class="btn" id="modalCopy" type="button">复制文案</button>
      ${pageBtn}
    </div>`;

    modalBody.innerHTML = html;
    modal.classList.add('open');

    document.getElementById('modalToggle').onclick = function () {
      toggleDay(id);
      showDayModal(day); // 刷新
    };
    document.getElementById('modalCopy').onclick = function () {
      const text = title + '\n\n' + content + (tip ? '\n\n【封面】' + tip : '');
      const btn = document.getElementById('modalCopy');
      const done = () => {
        btn.innerText = '✓ 已复制';
        setTimeout(() => btn.innerText = '复制文案', 1500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
      } else {
        fallbackCopy(text, done);
      }
    };
  }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function formatInline(s) {
    let out = escapeHTML(s);
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    return out;
  }

  /* ---------- 4. 简单搜索 ---------- */
  document.querySelectorAll('.search-box').forEach(function (box) {
    const target = document.querySelector(box.getAttribute('data-target') || '.searchable');
    if (!target) return;
    box.addEventListener('input', function () {
      const q = box.value.trim().toLowerCase();
      target.querySelectorAll('.search-item').forEach(function (item) {
        const text = item.innerText.toLowerCase();
        item.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });
  });

  /* ---------- 5. 初始化 ---------- */
  /* 详情页存在清单（SSOT：手动维护，新增 D{N}.html 时在这里加一行） */
  window.__xhs_day_pages = {
    D1: true, D2: true, D3: true, D4: true, D5: true, D6: true
  };

  /* D{N} → 实际日期映射（SSOT：起始日 = 2026-06-24 周三） */
  /* 来源：content-kit/daily-content.json（已与现实日期校准） */
  window.__xhs_day_dates = {
    D1: '2026-06-24 · 周三',
    D2: '2026-06-25 · 周四',
    D3: '2026-06-26 · 周五',
    D4: '2026-06-27 · 周六',
    D5: '2026-06-28 · 周日',
    D6: '2026-06-29 · 周一',
    D7: '2026-06-30 · 周二',
    D8: '2026-07-01 · 周三',
    D9: '2026-07-02 · 周四',
    D10: '2026-07-03 · 周五',
    D11: '2026-07-04 · 周六',
    D12: '2026-07-05 · 周日',
    D13: '2026-07-06 · 周一',
    D14: '2026-07-07 · 周二',
    D15: '2026-07-08 · 周三',
    D16: '2026-07-09 · 周四',
    D17: '2026-07-10 · 周五',
    D18: '2026-07-11 · 周六',
    D19: '2026-07-12 · 周日',
    D20: '2026-07-13 · 周一',
    D21: '2026-07-14 · 周二',
    D22: '2026-07-15 · 周三',
    D23: '2026-07-16 · 周四',
    D24: '2026-07-17 · 周五',
    D25: '2026-07-18 · 周六',
    D26: '2026-07-19 · 周日',
    D27: '2026-07-20 · 周一',
    D28: '2026-07-21 · 周二'
  };

  /* 给每个 cal-day 注入日期条 + 高亮"今天" */
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  document.querySelectorAll('.cal-day').forEach(function (day) {
    const id = day.getAttribute('data-day'); // D1..D28
    const dateText = window.__xhs_day_dates[id];
    if (!dateText) return;
    /* 拆成 ISO 日期 + 周几两段 */
    const [iso, weekday] = dateText.split(' · ');
    /* 在 day-num 后追加日期 */
    const numEl = day.querySelector('.day-num');
    if (numEl && !day.querySelector('.day-date')) {
      const dateEl = document.createElement('div');
      dateEl.className = 'day-date';
      dateEl.textContent = iso.slice(5); // MM-DD
      dateEl.title = dateText;            // hover 显示完整
      numEl.appendChild(dateEl);
    }
    /* 标记"今天" */
    if (iso === todayStr) {
      day.classList.add('is-today');
      const tag = document.createElement('span');
      tag.className = 'day-today-tag';
      tag.textContent = '今天';
      day.appendChild(tag);
    }
    /* 标记"已过期未完成"——软提醒 */
    if (iso < todayStr) {
      const isDone = getCompleted()[id];
      if (!isDone) day.classList.add('is-overdue');
    }
  });

  renderCompleted();

  /* ---------- 6. 移动端汉堡导航 ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    const setOpen = (open) => {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navLinks.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    /* 点 nav 链接后自动收起 */
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    /* 点页面其它地方关闭 */
    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('is-open')) return;
      if (e.target.closest('.nav')) return;
      setOpen(false);
    });
    /* ESC 关闭 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        setOpen(false);
        navToggle.focus();
      }
    });
    /* 视口拉宽到桌面端时强制收起（避免样式不匹配） */
    let lastIsMobile = window.matchMedia('(max-width: 768px)').matches;
    window.addEventListener('resize', function () {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (lastIsMobile && !isMobile) setOpen(false);
      lastIsMobile = isMobile;
    });
  }
})();
