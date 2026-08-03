// ==UserScript==
// @name         RisuRealm Wishlist
// @namespace    https://realm.risuai.net/
// @version      1.1.0
// @description  Add heart wishlist buttons to RisuRealm cards and keep a local importable/exportable wishlist.
// @match        https://realm.risuai.net/*
// @icon         https://realm.risuai.net/favicon.ico
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'rrw:wishlist:v1';
  const CARD_SELECTOR = [
    'a[href^="/character/"]',
    'a[href^="/preset/"]',
    'a[href^="/module/"]',
    'a[href*="/character/"]',
    'a[href*="/preset/"]',
    'a[href*="/module/"]',
  ].join(',');

  const css = `
    .rrw-card {
      position: relative !important;
    }

    .rrw-heart {
      align-items: center;
      backdrop-filter: blur(8px);
      background: rgba(17, 24, 39, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.28);
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
      color: #fff;
      cursor: pointer;
      display: inline-flex;
      font-size: 19px;
      font-weight: 700;
      height: 36px;
      justify-content: center;
      line-height: 1;
      position: absolute;
      right: 10px;
      top: 10px;
      transition: transform 140ms ease, background 140ms ease, color 140ms ease, border-color 140ms ease;
      user-select: none;
      width: 36px;
      z-index: 20;
    }

    .rrw-heart:hover {
      transform: scale(1.08);
    }

    .rrw-heart[aria-pressed="true"] {
      background: rgba(244, 63, 94, 0.95);
      border-color: rgba(255, 255, 255, 0.65);
      color: #fff;
    }

    .rrw-heart:focus-visible,
    .rrw-toolbar button:focus-visible,
    .rrw-panel button:focus-visible,
    .rrw-panel a:focus-visible {
      outline: 2px solid #f43f5e;
      outline-offset: 2px;
    }

    .rrw-card.rrw-hidden {
      display: none !important;
    }

    .rrw-toolbar {
      align-items: center;
      background: rgba(17, 24, 39, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      bottom: 18px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
      color: #fff;
      display: flex;
      gap: 6px;
      padding: 7px;
      position: fixed;
      right: 18px;
      z-index: 2147483646;
    }

    .rrw-toolbar button,
    .rrw-panel button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 999px;
      color: inherit;
      cursor: pointer;
      font: 13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 8px 11px;
    }

    .rrw-toolbar button:hover,
    .rrw-panel button:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .rrw-toolbar button[aria-pressed="true"] {
      background: #f43f5e;
      border-color: #fb7185;
    }

    .rrw-panel-backdrop {
      background: rgba(0, 0, 0, 0.38);
      inset: 0;
      position: fixed;
      z-index: 2147483646;
    }

    .rrw-panel {
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 14px;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
      color: #fff;
      display: flex;
      flex-direction: column;
      max-height: min(76vh, 680px);
      max-width: min(92vw, 560px);
      min-height: 260px;
      padding: 14px;
      position: fixed;
      right: 18px;
      top: 64px;
      width: 560px;
      z-index: 2147483647;
    }

    .rrw-panel-header {
      align-items: center;
      display: flex;
      gap: 10px;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .rrw-panel-title {
      font: 700 17px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .rrw-panel-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: flex-end;
    }

    .rrw-list {
      display: grid;
      gap: 8px;
      overflow: auto;
      padding-right: 3px;
    }

    .rrw-empty {
      align-items: center;
      color: rgba(255, 255, 255, 0.68);
      display: flex;
      flex: 1;
      font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      justify-content: center;
      text-align: center;
    }

    .rrw-item {
      align-items: center;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: inherit;
      display: grid;
      gap: 10px;
      grid-template-columns: 54px minmax(0, 1fr) auto;
      padding: 8px;
      text-decoration: none;
    }

    .rrw-item img {
      aspect-ratio: 1;
      border-radius: 8px;
      height: 54px;
      object-fit: cover;
      width: 54px;
    }

    .rrw-item-main {
      min-width: 0;
    }

    .rrw-item-title,
    .rrw-item-meta {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rrw-item-title {
      font: 700 14px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .rrw-item-meta {
      color: rgba(255, 255, 255, 0.68);
      font: 12px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin-top: 3px;
    }

    .rrw-remove {
      color: rgba(255, 255, 255, 0.72);
      height: 34px;
      padding: 0 !important;
      width: 34px;
    }

    @media (max-width: 640px) {
      .rrw-panel {
        inset: auto 10px 72px 10px;
        max-height: 72vh;
        max-width: none;
        top: auto;
        width: auto;
      }

      .rrw-toolbar {
        bottom: 12px;
        right: 12px;
      }
    }
  `;

  addStyle(css);

  let state = normalizeStore(readStore());
  let filterEnabled = false;
  let toolbar;
  let panel;
  let observerScheduled = false;

  bootstrap();

  function bootstrap() {
    renderToolbar();
    scanCards();
    observePage();
    patchHistory();
    window.addEventListener('popstate', scheduleScan);
  }

  function addStyle(text) {
    if (typeof GM_addStyle === 'function') {
      GM_addStyle(text);
      return;
    }

    const style = document.createElement('style');
    style.textContent = text;
    document.head.append(style);
  }

  function readStore() {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(STORAGE_KEY, null);
    } catch (_) {
      // Fall through to localStorage.
    }

    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function writeStore(nextState) {
    state = normalizeStore(nextState);
    const raw = JSON.stringify(state);

    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(STORAGE_KEY, raw);
      } else {
        localStorage.setItem(STORAGE_KEY, raw);
      }
    } catch (_) {
      try {
        localStorage.setItem(STORAGE_KEY, raw);
      } catch (error) {
        console.error('[RisuRealm Wishlist] Failed to save wishlist', error);
      }
    }

    refreshAll();
  }

  function normalizeStore(raw) {
    let parsed = raw;

    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        parsed = null;
      }
    }

    const items = parsed && typeof parsed === 'object' && parsed.items && typeof parsed.items === 'object'
      ? parsed.items
      : {};

    return { version: 1, items };
  }

  function canonicalPath(href) {
    try {
      const url = new URL(href, location.origin);
      return url.pathname.replace(/\/$/, '');
    } catch (_) {
      return href;
    }
  }

  function typeFromPath(path) {
    const match = path.match(/^\/([^/]+)\//);
    return match ? match[1] : 'item';
  }

  function isCard(anchor) {
    const path = canonicalPath(anchor.getAttribute('href') || anchor.href);
    return /^\/(character|preset|module)\//.test(path);
  }

  function extractMeta(card) {
    const path = canonicalPath(card.getAttribute('href') || card.href);
    const lines = (card.innerText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const img = card.querySelector('img');
    const image = img ? img.currentSrc || img.src || img.getAttribute('src') || '' : '';
    const alt = img ? (img.alt || '').trim() : '';
    const title = alt || lines.find((line) => !/^By\s+/i.test(line)) || path.split('/').pop() || 'Untitled';
    const authorLine = lines.find((line) => /^By\s+/i.test(line)) || '';
    const author = authorLine.replace(/^By\s+/i, '').trim();

    return {
      addedAt: new Date().toISOString(),
      author,
      image,
      path,
      title,
      type: typeFromPath(path),
      url: new URL(path, location.origin).href,
    };
  }

  function scanCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
      if (!(card instanceof HTMLAnchorElement) || !isCard(card)) return;
      if (card.dataset.rrwReady === '1') {
        updateCard(card);
        return;
      }

      card.dataset.rrwReady = '1';
      card.classList.add('rrw-card');

      const heart = document.createElement('span');
      heart.className = 'rrw-heart';
      heart.setAttribute('role', 'button');
      heart.setAttribute('tabindex', '0');
      heart.addEventListener('pointerdown', stopCardOpen, true);
      heart.addEventListener('click', (event) => {
        stopCardOpen(event);
        toggleCard(card);
      }, true);
      heart.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        stopCardOpen(event);
        toggleCard(card);
      }, true);

      card.append(heart);
      updateCard(card);
    });

    applyFilter();
    updateToolbar();
  }

  function stopCardOpen(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function toggleCard(card) {
    const meta = extractMeta(card);
    const next = { ...state, items: { ...state.items } };

    if (next.items[meta.path]) {
      delete next.items[meta.path];
    } else {
      next.items[meta.path] = meta;
    }

    writeStore(next);
  }

  function updateCard(card) {
    const path = canonicalPath(card.getAttribute('href') || card.href);
    const saved = Boolean(state.items[path]);
    const heart = card.querySelector('.rrw-heart');

    if (heart) {
      heart.textContent = saved ? '♥' : '♡';
      heart.setAttribute('aria-label', saved ? '从心愿单移除' : '加入心愿单');
      heart.setAttribute('title', saved ? '从心愿单移除' : '加入心愿单');
      heart.setAttribute('aria-pressed', String(saved));
    }
  }

  function renderToolbar() {
    if (toolbar) return;

    toolbar = document.createElement('div');
    toolbar.className = 'rrw-toolbar';
    toolbar.innerHTML = `
      <button type="button" data-rrw-action="open">♡ 心愿单 <span data-rrw-count>0</span></button>
      <button type="button" data-rrw-action="filter" aria-pressed="false">只看心愿</button>
    `;
    toolbar.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-rrw-action]');
      if (!button) return;

      if (button.dataset.rrwAction === 'open') {
        openPanel();
        return;
      }

      filterEnabled = !filterEnabled;
      button.setAttribute('aria-pressed', String(filterEnabled));
      applyFilter();
    });
    document.body.append(toolbar);
    updateToolbar();
  }

  function updateToolbar() {
    if (!toolbar) return;
    const count = Object.keys(state.items).length;
    const countNode = toolbar.querySelector('[data-rrw-count]');
    if (countNode) countNode.textContent = String(count);
    const filterButton = toolbar.querySelector('[data-rrw-action="filter"]');
    if (filterButton) filterButton.setAttribute('aria-pressed', String(filterEnabled));
  }

  function openPanel() {
    closePanel();

    const backdrop = document.createElement('div');
    backdrop.className = 'rrw-panel-backdrop';
    backdrop.addEventListener('click', closePanel);

    panel = document.createElement('section');
    panel.className = 'rrw-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'RisuRealm 心愿单');
    document.body.append(backdrop, panel);

    renderPanel();
  }

  function closePanel() {
    document.querySelectorAll('.rrw-panel, .rrw-panel-backdrop').forEach((node) => node.remove());
    panel = null;
  }

  function renderPanel() {
    if (!panel) return;

    const items = Object.values(state.items).sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')));
    panel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'rrw-panel-header';

    const title = document.createElement('div');
    title.className = 'rrw-panel-title';
    title.textContent = `心愿单 (${items.length})`;

    const actions = document.createElement('div');
    actions.className = 'rrw-panel-actions';

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = '清空';
    clearButton.addEventListener('click', () => {
      if (!items.length) return;
      if (confirm('确定清空 RisuRealm 心愿单吗？')) writeStore({ version: 1, items: {} });
    });

    const exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.textContent = '导出';
    exportButton.addEventListener('click', exportWishlist);

    const importButton = document.createElement('button');
    importButton.type = 'button';
    importButton.textContent = '导入';
    importButton.addEventListener('click', importWishlist);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '关闭';
    closeButton.addEventListener('click', closePanel);

    actions.append(importButton, exportButton, clearButton, closeButton);
    header.append(title, actions);
    panel.append(header);

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'rrw-empty';
      empty.textContent = '还没有加入心愿单的卡片。';
      panel.append(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'rrw-list';

    items.forEach((item) => {
      const row = document.createElement('a');
      row.className = 'rrw-item';
      row.href = item.url || new URL(item.path, location.origin).href;

      const img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.src = item.image || '';

      const main = document.createElement('div');
      main.className = 'rrw-item-main';

      const itemTitle = document.createElement('div');
      itemTitle.className = 'rrw-item-title';
      itemTitle.textContent = item.title || 'Untitled';

      const meta = document.createElement('div');
      meta.className = 'rrw-item-meta';
      meta.textContent = item.author ? `By ${item.author}` : item.type || '';

      const remove = document.createElement('button');
      remove.className = 'rrw-remove';
      remove.type = 'button';
      remove.textContent = '×';
      remove.title = '移除';
      remove.setAttribute('aria-label', `移除 ${item.title || item.path}`);
      remove.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = { ...state, items: { ...state.items } };
        delete next.items[item.path];
        writeStore(next);
      });

      main.append(itemTitle, meta);
      row.append(img, main, remove);
      list.append(row);
    });

    panel.append(list);
  }

  function exportWishlist() {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: 'RisuRealm Wishlist',
      version: 1,
      items: state.items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = URL.createObjectURL(blob);
    link.download = `risurealm-wishlist-${date}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function importWishlist() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.remove();
      if (!file) return;

      try {
        const imported = parseImportPayload(await file.text());
        const count = Object.keys(imported.items).length;
        if (!count) {
          alert('没有找到可导入的心愿单项目。');
          return;
        }

        const nextItems = { ...state.items, ...imported.items };
        const addedCount = Object.keys(nextItems).length - Object.keys(state.items).length;
        if (!confirm(`导入 ${count} 条心愿单项目？当前列表会合并，重复项目会以导入文件为准。`)) return;
        writeStore({ version: 1, items: nextItems });
        alert(`导入完成：新增 ${addedCount} 条，总计 ${Object.keys(nextItems).length} 条。`);
      } catch (error) {
        console.error('[RisuRealm Wishlist] Import failed', error);
        alert('导入失败：请选择由 RisuRealm Wishlist 导出的 JSON 文件。');
      }
    });
    document.body.append(input);
    input.click();
  }

  function parseImportPayload(text) {
    const parsed = JSON.parse(text);
    const rawItems = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object'
        ? parsed.items
        : null;

    if (!rawItems || typeof rawItems !== 'object') {
      throw new Error('Invalid wishlist payload');
    }

    const entries = Array.isArray(rawItems)
      ? rawItems.map((item) => [item && item.path, item])
      : Object.entries(rawItems);
    const items = {};

    entries.forEach(([path, item]) => {
      if (!item || typeof item !== 'object') return;
      const normalizedPath = canonicalPath(item.path || path || item.url || '');
      if (!/^\/(character|preset|module)\//.test(normalizedPath)) return;
      items[normalizedPath] = {
        addedAt: item.addedAt || new Date().toISOString(),
        author: String(item.author || ''),
        image: String(item.image || ''),
        path: normalizedPath,
        title: String(item.title || normalizedPath.split('/').pop() || 'Untitled'),
        type: item.type || typeFromPath(normalizedPath),
        url: new URL(normalizedPath, location.origin).href,
      };
    });

    return { version: 1, items };
  }

  function refreshAll() {
    document.querySelectorAll('a.rrw-card').forEach(updateCard);
    applyFilter();
    updateToolbar();
    renderPanel();
  }

  function applyFilter() {
    document.querySelectorAll('a.rrw-card').forEach((card) => {
      const path = canonicalPath(card.getAttribute('href') || card.href);
      card.classList.toggle('rrw-hidden', filterEnabled && !state.items[path]);
    });
  }

  function scheduleScan() {
    if (observerScheduled) return;
    observerScheduled = true;
    requestAnimationFrame(() => {
      observerScheduled = false;
      scanCards();
    });
  }

  function observePage() {
    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function patchHistory() {
    ['pushState', 'replaceState'].forEach((method) => {
      const original = history[method];
      history[method] = function patchedHistoryMethod() {
        const result = original.apply(this, arguments);
        scheduleScan();
        return result;
      };
    });
  }
})();
