// ==UserScript==
// @name         RisuRealm Wishlist
// @namespace    https://realm.risuai.net/
// @version      1.4.4
// @license      MIT
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
  const DETAIL_PATH_RE = /^\/(character|preset|module)\//;

  const css = `
    .rrw-card,
    .rrw-detail-card {
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
    .rrw-detail-button:focus-visible,
    .rrw-toolbar button:focus-visible,
    .rrw-panel button:focus-visible,
    .rrw-panel a:focus-visible {
      outline: 2px solid #f43f5e;
      outline-offset: 2px;
    }

    .rrw-card.rrw-hidden {
      display: none !important;
    }

    html.rrw-filtering a[href^="/character/"]:not([data-rrw-saved="1"]),
    html.rrw-filtering a[href^="/preset/"]:not([data-rrw-saved="1"]),
    html.rrw-filtering a[href^="/module/"]:not([data-rrw-saved="1"]),
    html.rrw-filtering a[href*="/character/"]:not([data-rrw-saved="1"]),
    html.rrw-filtering a[href*="/preset/"]:not([data-rrw-saved="1"]),
    html.rrw-filtering a[href*="/module/"]:not([data-rrw-saved="1"]) {
      display: none !important;
    }

    .rrw-detail-button {
      align-items: center;
      appearance: none;
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
      padding: 0;
      position: absolute;
      right: 10px;
      top: 10px;
      transition: transform 140ms ease, background 140ms ease, color 140ms ease, border-color 140ms ease;
      user-select: none;
      width: 36px;
      z-index: 20;
    }

    .rrw-detail-button:hover {
      transform: scale(1.08);
    }

    .rrw-detail-button[aria-pressed="true"] {
      background: rgba(244, 63, 94, 0.95);
      border-color: rgba(255, 255, 255, 0.65);
      color: #fff;
    }

    .rrw-toolbar {
      align-items: center;
      background: rgba(17, 24, 39, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
      color: #fff;
      display: flex;
      gap: 6px;
      left: calc(var(--rrw-vv-left, 0px) + var(--rrw-vv-width, 100vw) - 18px);
      padding: 7px;
      position: fixed;
      top: calc(var(--rrw-vv-top, 0px) + var(--rrw-vv-height, 100vh) - 18px);
      transform: translate(-100%, -100%);
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
      left: calc(var(--rrw-vv-left, 0px) + var(--rrw-vv-width, 100vw) - 18px);
      top: calc(var(--rrw-vv-top, 0px) + 64px);
      transform: translateX(-100%);
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

    .rrw-tabs {
      display: flex;
      flex: 1 1 180px;
      gap: 6px;
      min-width: 180px;
    }

    .rrw-tab {
      border-radius: 10px !important;
      font-weight: 700 !important;
      justify-content: center;
      min-width: 0;
      padding: 8px 9px !important;
      width: 100%;
    }

    .rrw-tab[aria-pressed="true"] {
      background: #f43f5e;
      border-color: #fb7185;
      color: #fff;
    }

    .rrw-filterbar {
      display: grid;
      gap: 8px;
      margin-bottom: 10px;
    }

    .rrw-selectbar,
    .rrw-tag-modes {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .rrw-tag-modes {
      margin-bottom: 6px;
    }

    .rrw-selected-count {
      color: rgba(255, 255, 255, 0.68);
      font: 12px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin-left: auto;
    }

    .rrw-tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 78px;
      overflow: auto;
    }

    .rrw-tag {
      border-radius: 999px !important;
      font-size: 12px !important;
      padding: 5px 8px !important;
    }

    .rrw-tag[aria-pressed="true"],
    .rrw-tag-mode[aria-pressed="true"] {
      background: #f43f5e;
      border-color: #fb7185;
      color: #fff;
    }

    .rrw-list {
      display: grid;
      gap: 8px;
      overflow: auto;
      padding-right: 3px;
    }

    .rrw-group {
      display: grid;
      gap: 8px;
    }

    .rrw-group + .rrw-group {
      margin-top: 10px;
    }

    .rrw-group-title {
      align-items: center;
      color: rgba(255, 255, 255, 0.82);
      display: flex;
      font: 700 13px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      justify-content: space-between;
      padding: 2px 2px 0;
    }

    .rrw-group-items {
      display: grid;
      gap: 8px;
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
      grid-template-columns: 24px 54px minmax(0, 1fr) auto;
      padding: 8px;
      text-decoration: none;
    }

    .rrw-item-check {
      accent-color: #f43f5e;
      height: 16px;
      width: 16px;
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

    .rrw-item-tags {
      color: rgba(255, 255, 255, 0.52);
      font: 11px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin-top: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rrw-remove {
      color: rgba(255, 255, 255, 0.72);
      height: 34px;
      padding: 0 !important;
      width: 34px;
    }

    html.rrw-mobile .rrw-panel {
      left: calc(var(--rrw-vv-left, 0px) + 10px);
      max-height: calc(var(--rrw-ui-height, 100vh) - 86px);
      max-width: none;
      top: calc(var(--rrw-vv-top, 0px) + 10px);
      transform: none;
      width: calc(var(--rrw-ui-width, 100vw) - 20px);
    }

    html.rrw-mobile .rrw-toolbar {
      border-radius: 16px;
      flex-wrap: wrap;
      left: calc(var(--rrw-vv-left, 0px) + 12px);
      max-width: calc(var(--rrw-ui-width, 100vw) - 24px);
      top: calc(var(--rrw-vv-top, 0px) + var(--rrw-ui-height, 100vh) - 12px);
      transform: translateY(-100%);
    }

    html.rrw-mobile .rrw-toolbar button {
      flex: 1 1 auto;
      min-width: 0;
    }

    html.rrw-mobile .rrw-panel-header {
      align-items: flex-start;
      flex-direction: column;
    }

    html.rrw-mobile .rrw-panel-actions {
      justify-content: flex-start;
      width: 100%;
    }

    html.rrw-mobile .rrw-item {
      gap: 8px;
      grid-template-columns: 24px 44px minmax(0, 1fr) 34px;
    }

    html.rrw-mobile .rrw-item img {
      height: 44px;
      width: 44px;
    }

    html.rrw-mobile .rrw-detail-button {
      right: 10px;
      top: 10px;
    }
  `;

  addStyle(css);

  let state = normalizeStore(readStore());
  let filterEnabled = false;
  let panelFilter = 'character';
  let tagFilterMode = 'any';
  let tagExpanded = false;
  const selectedPaths = new Set();
  const selectedTags = new Set();
  let toolbar;
  let panel;
  let detailButton;
  let observerScheduled = false;

  bootstrap();

  function bootstrap() {
    syncViewport();
    renderToolbar();
    renderDetailButton();
    scanCards();
    observePage();
    patchHistory();
    window.addEventListener('resize', syncViewport, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncViewport, { passive: true });
      window.visualViewport.addEventListener('scroll', syncViewport, { passive: true });
    }
    window.addEventListener('popstate', scheduleScan);
  }

  function syncViewport() {
    const viewport = window.visualViewport;
    const width = viewport ? viewport.width : window.innerWidth || document.documentElement.clientWidth || 0;
    const height = viewport ? viewport.height : window.innerHeight || document.documentElement.clientHeight || 0;
    const uiWidth = Math.min(width || Infinity, window.innerWidth || Infinity, (window.screen && window.screen.width) || Infinity);
    const uiHeight = Math.min(height || Infinity, window.innerHeight || Infinity, (window.screen && window.screen.height) || Infinity);
    const left = viewport ? viewport.offsetLeft : 0;
    const top = viewport ? viewport.offsetTop : 0;
    const root = document.documentElement;

    root.style.setProperty('--rrw-vv-left', `${Math.max(0, left)}px`);
    root.style.setProperty('--rrw-vv-top', `${Math.max(0, top)}px`);
    root.style.setProperty('--rrw-vv-width', `${Math.max(0, width)}px`);
    root.style.setProperty('--rrw-vv-height', `${Math.max(0, height)}px`);
    root.style.setProperty('--rrw-ui-width', `${Math.max(0, uiWidth === Infinity ? width : uiWidth)}px`);
    root.style.setProperty('--rrw-ui-height', `${Math.max(0, uiHeight === Infinity ? height : uiHeight)}px`);
    root.classList.toggle('rrw-mobile', uiWidth <= 640);
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
    persistStore();
    refreshAll();
  }

  function persistStore() {
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

    const rawItems = parsed && typeof parsed === 'object' && parsed.items && typeof parsed.items === 'object'
      ? parsed.items
      : {};
    const items = {};

    Object.entries(rawItems).forEach(([path, item]) => {
      if (!item || typeof item !== 'object') return;
      items[path] = { ...item, tags: normalizeTags(item.tags || []) };
    });

    return { version: 1, items };
  }

  function normalizeTags(tags) {
    const seen = new Set();
    return (Array.isArray(tags) ? tags : [])
      .map((tag) => String(tag || '').trim())
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (!tag || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 60);
  }

  function tagKey(tag) {
    return String(tag || '').trim().toLowerCase();
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

  function idFromPath(path) {
    const match = String(path || '').match(/\/(?:character|preset|module)\/([^/?#]+)/);
    return match ? match[1] : '';
  }

  function currentDetailPath() {
    const path = canonicalPath(location.href);
    return DETAIL_PATH_RE.test(path) ? path : '';
  }

  function detectCurrentPageType(fallbackPath) {
    const typeLabels = new Set(['character', 'preset', 'module', 'lorebook']);
    const lines = (document.body.innerText || '')
      .split('\n')
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean);
    const visibleType = lines.find((line) => typeLabels.has(line));

    if (visibleType === 'lorebook') return 'module';
    return visibleType || typeFromPath(fallbackPath);
  }

  function isCard(anchor) {
    const path = canonicalPath(anchor.getAttribute('href') || anchor.href);
    if (!DETAIL_PATH_RE.test(path)) return false;

    const text = (anchor.innerText || '').trim();
    const className = String(anchor.className || '');
    const rect = anchor.getBoundingClientRect();
    const hasCardClass = /\bborder\b/.test(className) && /\bflex\b/.test(className) && /\brounded-md\b/.test(className);
    const hasCardContent = Boolean(anchor.querySelector('img')) && /\bBy\s+/i.test(text);

    return hasCardClass && hasCardContent && rect.width >= 160 && rect.height >= 100;
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
      tags: extractTags(card, title, author),
      title,
      type: detectCurrentPageType(path),
      url: new URL(path, location.origin).href,
    };
  }

  function extractCurrentPageMeta() {
    const path = currentDetailPath();
    const lines = (document.body.innerText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const titleFromDocument = document.title.replace(/^RisuRealm\s*-\s*/i, '').trim();
    const title = titleFromDocument
      || lines.find((line) => !/^(Upload|Account|Download|Options|Help|RisuRealm|Click to preview|Comments are disabled)/i.test(line) && !/^By\s+/i.test(line))
      || path.split('/').pop()
      || 'Untitled';
    const authorLine = lines.find((line) => /^By\s+/i.test(line)) || '';
    const author = authorLine.replace(/^By\s+/i, '').trim();
    const image = findBestPageImage(title);
    const container = findDetailCardContainer();
    const download = findDownloadLink(container || document);

    return {
      addedAt: state.items[path] ? state.items[path].addedAt : new Date().toISOString(),
      author,
      downloadName: download.name,
      downloadType: download.type,
      downloadUrl: download.url,
      image,
      path,
      tags: extractTags(container || document.body, title, author),
      title,
      type: detectCurrentPageType(path),
      url: new URL(path, location.origin).href,
    };
  }

  function findDownloadLink(root) {
    const link = root && root.querySelector ? root.querySelector('a[href*="/api/v1/download/"]') : null;
    if (!link) return { name: '', type: '', url: '' };
    const url = new URL(link.getAttribute('href'), location.origin).href;
    return {
      name: link.getAttribute('download') || '',
      type: downloadTypeFromUrl(url),
      url,
    };
  }

  function downloadTypeFromUrl(url) {
    if (url.includes('/charx-v3/')) return 'charx';
    if (url.includes('/png-v3/')) return 'normal';
    if (url.includes('/preset-risu-v1/')) return 'preset';
    if (url.includes('/module-v1/')) return 'module';
    return '';
  }

  function extractTags(root, title, author) {
    const ignored = new Set([title, author, `By ${author}`, '♡', '♥', 'No creator comments'].filter(Boolean));
    const lines = (root && root.innerText ? root.innerText : '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return normalizeTags(lines.filter((line) => isTagLine(line, ignored)));
  }

  function isTagLine(line, ignored) {
    if (ignored.has(line)) return false;
    if (line.length > 40 || /\s/.test(line)) return false;
    if (/^By\s+/i.test(line) || /^https?:\/\//i.test(line)) return false;
    if (/^[\d.,kKmM]+$/.test(line)) return false;
    if (/[()[\]{}<>`"“”]/.test(line)) return false;
    return /^[\p{L}\p{N}_+#&.'-]+$/u.test(line);
  }

  function findBestPageImage(title) {
    const images = Array.from(document.images)
      .map((img) => ({
        alt: (img.alt || '').trim(),
        area: (img.naturalWidth || img.width || 0) * (img.naturalHeight || img.height || 0),
        src: img.currentSrc || img.src || img.getAttribute('src') || '',
      }))
      .filter((img) => img.src && !img.src.startsWith('data:'));
    const exactAlt = images.find((img) => img.alt && img.alt === title);
    if (exactAlt) return exactAlt.src;

    images.sort((a, b) => b.area - a.area);
    return images[0] ? images[0].src : '';
  }

  function scanCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
      if (!(card instanceof HTMLAnchorElement)) return;
      if (!isCard(card)) {
        resetCardButton(card);
        return;
      }
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

  function resetCardButton(card) {
    Array.from(card.children).forEach((child) => {
      if (child.classList && child.classList.contains('rrw-heart')) child.remove();
    });
    card.classList.remove('rrw-card', 'rrw-hidden');
    delete card.dataset.rrwReady;
    delete card.dataset.rrwSaved;
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

    card.dataset.rrwSaved = saved ? '1' : '0';
    if (saved) refreshSavedMeta(extractMeta(card));

    if (heart) {
      heart.textContent = saved ? '♥' : '♡';
      heart.setAttribute('aria-label', saved ? '从心愿单移除' : '加入心愿单');
      heart.setAttribute('title', saved ? '从心愿单移除' : '加入心愿单');
      heart.setAttribute('aria-pressed', String(saved));
    }
  }

  function refreshSavedMeta(meta) {
    const current = state.items[meta.path];
    if (!current) return;

    const tags = normalizeTags([...(current.tags || []), ...(meta.tags || [])]);
    const changed = tags.join('\n') !== itemTags(current).join('\n')
      || (!current.image && meta.image)
      || (!current.author && meta.author)
      || (!current.downloadUrl && meta.downloadUrl);
    if (!changed) return;

    state.items[meta.path] = {
      ...current,
      author: current.author || meta.author,
      downloadName: current.downloadName || meta.downloadName,
      downloadType: current.downloadType || meta.downloadType,
      downloadUrl: current.downloadUrl || meta.downloadUrl,
      image: current.image || meta.image,
      tags,
      title: current.title || meta.title,
      type: current.type || meta.type,
      url: current.url || meta.url,
    };
    persistStore();
    renderPanel();
  }

  function findDetailCardContainer() {
    const path = currentDetailPath();
    if (!path) return null;

    const title = document.title.replace(/^RisuRealm\s*-\s*/i, '').trim();
    const candidates = Array.from(document.querySelectorAll('main, article, section, div'))
      .filter((el) => {
        if (toolbar && toolbar.contains(el)) return false;
        if (panel && panel.contains(el)) return false;
        if (detailButton && detailButton.contains(el)) return false;

        const rect = el.getBoundingClientRect();
        if (rect.width < 160 || rect.height < 120) return false;

        const text = (el.innerText || '').trim();
        if (!text || text.length > 20000) return false;
        if (title && !text.includes(title)) return false;
        if (!/\bBy\s+/i.test(text) && !text.includes('By ')) return false;

        const hasAction = /\bDownload\b|\bOptions\b|Click to/i.test(text);
        const hasImage = Boolean(el.querySelector('img'));
        return hasAction || hasImage;
      })
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return { el, area: rect.width * rect.height, y: rect.top };
      })
      .sort((a, b) => a.area - b.area || a.y - b.y);

    return candidates[0] ? candidates[0].el : null;
  }

  function renderDetailButton() {
    const path = currentDetailPath();
    const container = findDetailCardContainer();

    if (!path || !container) {
      if (detailButton) {
        detailButton.remove();
        detailButton = null;
      }
      return;
    }

    if (!detailButton) {
      detailButton = document.createElement('button');
      detailButton.className = 'rrw-detail-button';
      detailButton.type = 'button';
      detailButton.addEventListener('click', toggleCurrentPage);
    }

    container.classList.add('rrw-detail-card');
    if (detailButton.parentElement !== container) container.append(detailButton);
    updateDetailButton();
  }

  function toggleCurrentPage() {
    const meta = extractCurrentPageMeta();
    const next = { ...state, items: { ...state.items } };

    if (next.items[meta.path]) {
      delete next.items[meta.path];
    } else {
      next.items[meta.path] = meta;
    }

    writeStore(next);
  }

  function updateDetailButton() {
    if (!detailButton) return;

    const path = currentDetailPath();
    const saved = Boolean(path && state.items[path]);
    const text = saved ? '♥' : '♡';

    if (detailButton.textContent !== text) detailButton.textContent = text;
    detailButton.setAttribute('aria-label', saved ? '从心愿单移除' : '加入心愿单');
    detailButton.setAttribute('title', saved ? '从心愿单移除' : '加入心愿单');
    detailButton.setAttribute('aria-pressed', String(saved));
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
    const count = Object.values(state.items).filter((item) => {
      const key = wishlistGroupKey(item);
      return key === 'character' || key === 'preset';
    }).length;
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
    const characterItems = items.filter((item) => wishlistGroupKey(item) === 'character');
    const presetItems = items.filter((item) => wishlistGroupKey(item) === 'preset');
    const visibleTotal = characterItems.length + presetItems.length;
    const tabItems = panelFilter === 'preset' ? presetItems : characterItems;
    const activeItems = tabItems.filter(matchesTagFilter);
    const selectedCount = getSelectedItems().length;
    panel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'rrw-panel-header';

    const title = document.createElement('div');
    title.className = 'rrw-panel-title';
    title.textContent = `心愿单 (${visibleTotal})`;

    const actions = document.createElement('div');
    actions.className = 'rrw-panel-actions';

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = '清空';
    clearButton.addEventListener('click', () => {
      if (!items.length) return;
      if (confirm('确定清空 RisuRealm 心愿单吗？')) {
        selectedPaths.clear();
        selectedTags.clear();
        writeStore({ version: 1, items: {} });
      }
    });

    const exportSelectedButton = document.createElement('button');
    exportSelectedButton.type = 'button';
    exportSelectedButton.textContent = '导出所选';
    exportSelectedButton.addEventListener('click', exportSelectedWishlist);

    const downloadSelectedButton = document.createElement('button');
    downloadSelectedButton.type = 'button';
    downloadSelectedButton.textContent = '直接下载所选';
    downloadSelectedButton.addEventListener('click', downloadSelectedItems);

    const importButton = document.createElement('button');
    importButton.type = 'button';
    importButton.textContent = '导入';
    importButton.addEventListener('click', importWishlist);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '关闭';
    closeButton.addEventListener('click', closePanel);

    actions.append(importButton, exportSelectedButton, downloadSelectedButton, clearButton, closeButton);
    header.append(title, actions);
    panel.append(header);

    if (visibleTotal) {
      panel.append(createFilterBar(characterItems, presetItems, activeItems, selectedCount));
    }

    if (!visibleTotal) {
      const empty = document.createElement('div');
      empty.className = 'rrw-empty';
      empty.textContent = '还没有加入心愿单的角色卡或预设。';
      panel.append(empty);
      return;
    }

    if (!activeItems.length) {
      const empty = document.createElement('div');
      empty.className = 'rrw-empty';
      empty.textContent = selectedTags.size
        ? '没有符合当前 tag 筛选的项目。'
        : panelFilter === 'preset'
        ? '还没有加入心愿单的预设。'
        : '还没有加入心愿单的角色卡。';
      panel.append(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'rrw-list';
    activeItems.forEach((item) => {
      list.append(createWishlistRow(item));
    });

    panel.append(list);
  }

  function createWishlistTab(filter, label) {
    const button = document.createElement('button');
    button.className = 'rrw-tab';
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(panelFilter === filter));
    button.addEventListener('click', () => {
      panelFilter = filter;
      renderPanel();
    });
    return button;
  }

  function createFilterBar(characterItems, presetItems, activeItems, selectedCount) {
    const bar = document.createElement('div');
    bar.className = 'rrw-filterbar';

    const selectBar = document.createElement('div');
    selectBar.className = 'rrw-selectbar';
    const tabItems = panelFilter === 'preset' ? presetItems : characterItems;

    const tabs = document.createElement('div');
    tabs.className = 'rrw-tabs';
    tabs.append(
      createWishlistTab('character', `角色卡 (${characterItems.length})`),
      createWishlistTab('preset', `预设 (${presetItems.length})`),
    );

    const allSelected = activeItems.length > 0 && activeItems.every((item) => selectedPaths.has(item.path));
    const selectAllButton = document.createElement('button');
    selectAllButton.type = 'button';
    selectAllButton.textContent = allSelected ? '取消全选' : '全选当前';
    selectAllButton.addEventListener('click', () => {
      activeItems.forEach((item) => {
        if (allSelected) selectedPaths.delete(item.path);
        else selectedPaths.add(item.path);
      });
      renderPanel();
    });

    const clearSelectedButton = document.createElement('button');
    clearSelectedButton.type = 'button';
    clearSelectedButton.textContent = '清除选择';
    clearSelectedButton.addEventListener('click', () => {
      selectedPaths.clear();
      renderPanel();
    });

    const tags = collectTags(tabItems);
    const tagToggleButton = document.createElement('button');
    tagToggleButton.type = 'button';
    tagToggleButton.textContent = selectedTags.size ? `Tag (${selectedTags.size})` : 'Tag';
    tagToggleButton.setAttribute('aria-expanded', String(tagExpanded));
    tagToggleButton.setAttribute('aria-pressed', String(tagExpanded || selectedTags.size > 0));
    tagToggleButton.addEventListener('click', () => {
      tagExpanded = !tagExpanded;
      renderPanel();
    });

    const count = document.createElement('span');
    count.className = 'rrw-selected-count';
    count.textContent = `已选 ${selectedCount}`;
    selectBar.append(tabs, selectAllButton, clearSelectedButton, tagToggleButton, count);
    bar.append(selectBar);

    if (!tagExpanded || !tags.length) return bar;

    const modes = document.createElement('div');
    modes.className = 'rrw-tag-modes';
    modes.append(createTagModeButton('any', '并集'), createTagModeButton('all', '交集'));

    const clearTags = document.createElement('button');
    clearTags.type = 'button';
    clearTags.textContent = '清除 tag';
    clearTags.addEventListener('click', () => {
      selectedTags.clear();
      renderPanel();
    });
    modes.append(clearTags);

    const tagList = document.createElement('div');
    tagList.className = 'rrw-tag-list';
    tags.forEach((tag) => tagList.append(createTagButton(tag)));
    bar.append(modes, tagList);
    return bar;
  }

  function createTagModeButton(mode, label) {
    const button = document.createElement('button');
    button.className = 'rrw-tag-mode';
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(tagFilterMode === mode));
    button.addEventListener('click', () => {
      tagFilterMode = mode;
      renderPanel();
    });
    return button;
  }

  function createTagButton(tag) {
    const button = document.createElement('button');
    const key = tagKey(tag);
    button.className = 'rrw-tag';
    button.type = 'button';
    button.textContent = tag;
    button.setAttribute('aria-pressed', String(selectedTags.has(key)));
    button.addEventListener('click', () => {
      if (selectedTags.has(key)) selectedTags.delete(key);
      else selectedTags.add(key);
      renderPanel();
    });
    return button;
  }

  function collectTags(items) {
    const tags = new Map();
    items.forEach((item) => {
      itemTags(item).forEach((tag) => {
        const key = tagKey(tag);
        if (!tags.has(key)) tags.set(key, tag);
      });
    });
    return Array.from(tags.values()).sort((a, b) => a.localeCompare(b));
  }

  function matchesTagFilter(item) {
    if (!selectedTags.size) return true;
    const tags = new Set(itemTags(item).map(tagKey));
    if (tagFilterMode === 'all') {
      return Array.from(selectedTags).every((tag) => tags.has(tag));
    }
    return Array.from(selectedTags).some((tag) => tags.has(tag));
  }

  function itemTags(item) {
    return normalizeTags(item && item.tags);
  }

  function getSelectedItems() {
    return Object.values(state.items).filter((item) => selectedPaths.has(item.path));
  }

  function wishlistGroupKey(item) {
    const type = String(item.type || typeFromPath(item.path || '')).toLowerCase();
    if (type === 'character' || type === 'normal' || type === 'charx') return 'character';
    if (type === 'preset') return 'preset';
    if (type === 'module' || type === 'lorebook') return 'module';
    return 'other';
  }

  function createWishlistRow(item) {
    const row = document.createElement('a');
    row.className = 'rrw-item';
    row.href = item.url || new URL(item.path, location.origin).href;

    const checkbox = document.createElement('input');
    checkbox.className = 'rrw-item-check';
    checkbox.type = 'checkbox';
    checkbox.checked = selectedPaths.has(item.path);
    checkbox.title = '选择';
    checkbox.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    checkbox.addEventListener('change', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (checkbox.checked) selectedPaths.add(item.path);
      else selectedPaths.delete(item.path);
      renderPanel();
    });

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

    const tags = document.createElement('div');
    tags.className = 'rrw-item-tags';
    tags.textContent = itemTags(item).join(' · ');

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
      selectedPaths.delete(item.path);
      writeStore(next);
    });

    main.append(itemTitle, meta);
    if (tags.textContent) main.append(tags);
    row.append(checkbox, img, main, remove);
    return row;
  }

  function exportWishlist(items, name) {
    const exportItems = (items && items.length ? items : Object.values(state.items));
    const payload = {
      exportedAt: new Date().toISOString(),
      source: 'RisuRealm Wishlist',
      version: 1,
      items: Object.fromEntries(exportItems.map((item) => [item.path, item])),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = URL.createObjectURL(blob);
    link.download = `${name || 'risurealm-wishlist'}-${date}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function exportSelectedWishlist() {
    const items = getSelectedItems();
    if (!items.length) {
      alert('请先勾选要导出的项目。');
      return;
    }
    exportWishlist(items, 'risurealm-wishlist-selected');
  }

  async function downloadSelectedItems() {
    const items = getSelectedItems();
    if (!items.length) {
      alert('请先勾选要下载的项目。');
      return;
    }
    if (items.length > 8 && !confirm(`将直接下载 ${items.length} 个文件，浏览器可能会请求允许多个下载。继续吗？`)) return;

    const failed = [];
    for (const item of items) {
      const ok = await downloadItem(item);
      if (!ok) failed.push(item.title || item.path);
    }
    if (failed.length) alert(`以下项目未找到可用下载链接：\n${failed.slice(0, 10).join('\n')}${failed.length > 10 ? '\n...' : ''}`);
  }

  async function downloadItem(item) {
    for (const candidate of downloadCandidates(item)) {
      try {
        const response = await fetch(candidate.url);
        if (!response.ok) continue;
        const blob = await response.blob();
        triggerDownload(blob, candidate.name);
        return true;
      } catch (_) {
        // Try next candidate.
      }
    }
    return false;
  }

  function downloadCandidates(item) {
    const id = idFromPath(item.path);
    if (!id) return [];

    const title = safeFileName(item.title || id);
    const type = String(item.downloadType || item.type || typeFromPath(item.path)).toLowerCase();
    const candidates = [];

    if (item.downloadUrl) candidates.push({ name: item.downloadName || `${title}.download`, url: item.downloadUrl });
    if (type === 'charx') candidates.push({ name: `${title}.charx`, url: `/api/v1/download/charx-v3/${id}` });
    if (type === 'normal') candidates.push({ name: `${title}.png`, url: `/api/v1/download/png-v3/${id}` });
    if (type === 'preset') candidates.push({ name: `${title}.risupreset`, url: `/api/v1/download/preset-risu-v1/${id}` });
    if (type === 'module' || type === 'lorebook') candidates.push({ name: `${title}.json`, url: `/api/v1/download/module-v1/${id}` });
    if (type === 'character') {
      candidates.push(
        { name: `${title}.charx`, url: `/api/v1/download/charx-v3/${id}` },
        { name: `${title}.png`, url: `/api/v1/download/png-v3/${id}` },
      );
    }

    const seen = new Set();
    return candidates.filter((candidate) => {
      const url = new URL(candidate.url, location.origin).href;
      if (seen.has(url)) return false;
      seen.add(url);
      candidate.url = url;
      return true;
    });
  }

  function triggerDownload(blob, name) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function safeFileName(name) {
    return String(name || 'risurealm-card').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120);
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
      if (!DETAIL_PATH_RE.test(normalizedPath)) return;
      items[normalizedPath] = {
        addedAt: item.addedAt || new Date().toISOString(),
        author: String(item.author || ''),
        downloadName: String(item.downloadName || ''),
        downloadType: String(item.downloadType || ''),
        downloadUrl: String(item.downloadUrl || ''),
        image: String(item.image || ''),
        path: normalizedPath,
        tags: normalizeTags(item.tags || []),
        title: String(item.title || normalizedPath.split('/').pop() || 'Untitled'),
        type: item.type || typeFromPath(normalizedPath),
        url: new URL(normalizedPath, location.origin).href,
      };
    });

    return { version: 1, items };
  }

  function refreshAll() {
    document.querySelectorAll('a.rrw-card').forEach(updateCard);
    renderDetailButton();
    applyFilter();
    updateToolbar();
    renderPanel();
  }

  function applyFilter() {
    document.documentElement.classList.toggle('rrw-filtering', filterEnabled && !currentDetailPath());
  }

  function scheduleScan() {
    if (observerScheduled) return;
    observerScheduled = true;
    requestAnimationFrame(() => {
      observerScheduled = false;
      renderDetailButton();
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
