// ==UserScript==
// @name         RisuRealm Pagination Plus (Deprecated)
// @namespace    https://realm.risuai.net/
// @version      1.0.8
// @license      MIT
// @description  Deprecated: use RisuRealm UI Plus instead.
// @match        https://realm.risuai.net/*
// @icon         https://realm.risuai.net/favicon.ico
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const css = `
    .rrp-native-hidden {
      display: none !important;
    }

    .rrp-pager {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin: 16px auto 10px;
      max-width: min(100%, 720px);
      padding: 0 12px;
    }

    .rrp-pager button,
    .rrp-pager input {
      background: #e5e7eb;
      border: 1px solid rgba(17, 24, 39, 0.12);
      border-radius: 999px;
      box-sizing: border-box;
      color: #1f2937;
      flex: 0 0 auto;
      font: 600 13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      height: 36px;
      white-space: nowrap;
    }

    .rrp-pager button {
      cursor: pointer;
      min-width: 36px;
      padding: 0 13px;
    }

    .rrp-pager button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .rrp-pager .rrp-page-current:disabled {
      background: #f43f5e;
      border-color: #fb7185;
      color: #fff;
      opacity: 1;
    }

    .rrp-pager input {
      padding: 0 10px;
      text-align: center;
      width: 86px;
    }

    .rrp-page-label {
      color: rgba(17, 24, 39, 0.72);
      font: 600 13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .rrp-jump-row {
      align-items: center;
      display: flex;
      flex: 0 0 100%;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 2px;
    }

    .rrp-scroll-controls {
      bottom: 92px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: fixed;
      right: 16px;
      z-index: 9999;
    }

    .rrp-scroll-controls button {
      align-items: center;
      background: #f43f5e;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22);
      color: #fff;
      cursor: pointer;
      display: flex;
      font: 800 18px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      height: 44px;
      justify-content: center;
      min-width: 44px;
      padding: 0;
      width: 44px;
    }

    .rrp-scroll-controls button[hidden],
    .rrp-scroll-controls[hidden] {
      display: none !important;
    }

    @media (max-width: 640px) {
      .rrp-scroll-controls {
        bottom: 82px;
        right: 10px;
      }
    }
  `;

  let pager;
  let scrollControls;
  let scheduled = false;
  let scrollScheduled = false;
  const FILTER_PARAMS = ['sort', 'mode', 'nsfw'];

  addStyle(css);
  repairCurrentUrl();
  render();
  ensureScrollControls();
  updateScrollControls();
  observe();
  patchHistory();
  document.addEventListener('click', normalizeLinkNavigation, true);
  window.addEventListener('scroll', scheduleScrollControls, { passive: true });
  window.addEventListener('resize', scheduleScrollControls);
  window.addEventListener('popstate', scheduleRender);

  function render() {
    const nativePager = findNativePager();
    if (!nativePager || !isListPage()) {
      if (pager) pager.remove();
      pager = null;
      document.querySelectorAll('.rrp-native-hidden').forEach((node) => node.classList.remove('rrp-native-hidden'));
      return;
    }

    nativePager.classList.add('rrp-native-hidden');
    if (!pager) {
      pager = document.createElement('form');
      pager.className = 'rrp-pager';
      pager.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = pager.querySelector('input');
        goToPage(Number(input && input.value));
      });
      nativePager.insertAdjacentElement('afterend', pager);
    } else if (pager.previousElementSibling !== nativePager) {
      nativePager.insertAdjacentElement('afterend', pager);
    }

    const page = currentPage();
    if (pager.dataset.rrpPage === String(page)) return;
    pager.dataset.rrpPage = String(page);
    pager.innerHTML = '';
    pager.append(
      button('首页', () => goToPage(1), page <= 1),
      button('-10', () => goToPage(page - 10), page <= 1),
      button('上一页', () => goToPage(page - 1), page <= 1),
      ...pageButtons(page),
      button('下一页', () => goToPage(page + 1)),
      button('+10', () => goToPage(page + 10)),
      jumpRow(page)
    );
  }

  function pageButtons(page) {
    const nodes = [];
    const start = Math.max(1, page - 2);
    const end = page + 2;

    if (start > 1) {
      nodes.push(label('…'));
    }

    for (let n = start; n <= end; n += 1) {
      const node = button(String(n), () => goToPage(n), n === page);
      if (n === page) node.classList.add('rrp-page-current');
      nodes.push(node);
    }

    nodes.push(label('…'));
    return nodes;
  }

  function jumpRow(page) {
    const node = document.createElement('div');
    node.className = 'rrp-jump-row';
    node.append(
      label('第'),
      input(page),
      label('页'),
      button('跳转', () => goToPage(Number(node.querySelector('input').value)))
    );
    return node;
  }

  function findNativePager() {
    return Array.from(document.querySelectorAll('div.mt-4.w-full.flex.justify-center.items-center'))
      .find((node) => node.querySelectorAll('button').length >= 2 && /^\d+$/.test((node.textContent || '').trim()));
  }

  function isListPage() {
    return location.pathname === '/' || location.pathname === '';
  }

  function isListPath(pathname) {
    return pathname === '/' || pathname === '';
  }

  function currentPage() {
    const page = Number(new URL(location.href).searchParams.get('page') || 1);
    return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  }

  function goToPage(page) {
    if (!Number.isFinite(page)) return;
    const nextPage = Math.max(1, Math.floor(page));
    const url = new URL(location.href);
    if (!url.searchParams.has('sort')) url.searchParams.set('sort', '');
    url.searchParams.set('page', String(nextPage));
    normalizeListQuery(url);
    location.href = url.href;
  }

  function normalizeListUrl(rawUrl) {
    if (rawUrl == null) return rawUrl;
    let url;
    try {
      url = new URL(rawUrl, location.href);
    } catch (error) {
      return rawUrl;
    }
    if (url.origin !== location.origin || !isListPath(url.pathname)) return rawUrl;

    const current = new URL(location.href);
    const filterChanged = FILTER_PARAMS.some((key) => (current.searchParams.get(key) || '') !== (url.searchParams.get(key) || ''));
    if (filterChanged) url.searchParams.set('page', '1');
    if (url.searchParams.has('page') && !url.searchParams.has('sort')) url.searchParams.set('sort', '');
    normalizeListQuery(url);
    return url.href;
  }

  function normalizeListQuery(url) {
    const page = Number(url.searchParams.get('page') || 1);
    if ((url.searchParams.get('sort') || '') === 'recommended' && Number.isFinite(page) && page > 1) {
      url.searchParams.set('sort', '');
    }

    const original = new URLSearchParams(url.search);
    const ordered = new URLSearchParams();
    ['sort', 'mode', 'page', 'nsfw'].forEach((key) => {
      if (original.has(key)) ordered.set(key, original.get(key) || '');
    });
    original.forEach((value, key) => {
      if (!['sort', 'mode', 'page', 'nsfw'].includes(key)) ordered.append(key, value);
    });
    url.search = ordered.toString();
  }

  function repairCurrentUrl() {
    const nextUrl = normalizeListUrl(location.href);
    if (nextUrl !== location.href) location.replace(nextUrl);
  }

  function normalizeLinkNavigation(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target && (event.target.nodeType === 1 ? event.target : event.target.parentElement);
    const link = target && target.closest ? target.closest('a[href]') : null;
    if (!link) return;
    const nextUrl = normalizeListUrl(link.getAttribute('href'));
    if (nextUrl === link.href || nextUrl === link.getAttribute('href')) return;
    event.preventDefault();
    location.href = nextUrl;
  }

  function button(text, onClick, disabled) {
    const node = document.createElement('button');
    node.type = 'button';
    node.textContent = text;
    node.disabled = Boolean(disabled);
    node.addEventListener('click', onClick);
    return node;
  }

  function input(page) {
    const node = document.createElement('input');
    node.type = 'number';
    node.min = '1';
    node.step = '1';
    node.inputMode = 'numeric';
    node.value = String(page);
    node.setAttribute('aria-label', '页码');
    return node;
  }

  function label(text) {
    const node = document.createElement('span');
    node.className = 'rrp-page-label';
    node.textContent = text;
    return node;
  }

  function ensureScrollControls() {
    if (scrollControls) return;
    scrollControls = document.createElement('div');
    scrollControls.className = 'rrp-scroll-controls';
    scrollControls.append(
      scrollButton('↑', '回到顶部', () => scrollToEdge('top')),
      scrollButton('↓', '回到底部', () => scrollToEdge('bottom'))
    );
    document.body.append(scrollControls);
  }

  function scrollButton(text, title, onClick) {
    const node = button(text, onClick);
    node.title = title;
    node.setAttribute('aria-label', title);
    return node;
  }

  function scrollToEdge(edge) {
    const height = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
    window.scrollTo({ top: edge === 'top' ? 0 : height, behavior: 'smooth' });
  }

  function scheduleScrollControls() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      updateScrollControls();
    });
  }

  function updateScrollControls() {
    if (!scrollControls) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const up = scrollControls.children[0];
    const down = scrollControls.children[1];

    scrollControls.hidden = maxScroll <= 8;
    up.hidden = scrollTop <= 8;
    down.hidden = scrollTop >= maxScroll - 8;
  }

  function scheduleRender() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
      scheduleScrollControls();
    });
  }

  function observe() {
    new MutationObserver(() => {
      scheduleRender();
      scheduleScrollControls();
    }).observe(document.body, { childList: true, subtree: true });
  }

  function patchHistory() {
    ['pushState', 'replaceState'].forEach((method) => {
      const original = history[method];
      history[method] = function patchedHistoryMethod() {
        if (arguments.length > 2) arguments[2] = normalizeListUrl(arguments[2]);
        const result = original.apply(this, arguments);
        scheduleRender();
        return result;
      };
    });
  }

  function addStyle(text) {
    const style = document.createElement('style');
    style.textContent = text;
    (document.head || document.documentElement).append(style);
  }
})();
