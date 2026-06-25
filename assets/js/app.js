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

    let html = `<div class="day-label" style="font-size:12px; color:var(--text-faint); font-weight:700; letter-spacing:1px; text-transform:uppercase;">${escapeHTML(dayNum)} · ${escapeHTML(type)}</div>`;
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
    html += `<div class="mt-3" style="display:flex; gap:8px; flex-wrap:wrap;">
      <button class="btn btn-primary" id="modalToggle" type="button">${getCompleted()[id] ? '✓ 已完成（点击取消）' : '标记为已完成'}</button>
      <button class="btn" id="modalCopy" type="button">复制文案</button>
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
  renderCompleted();
})();
