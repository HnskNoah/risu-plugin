// ==UserScript==
// @name         RisuRealm Pagination Plus (Deprecated)
// @namespace    https://realm.risuai.net/
// @version      1.0.4
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
      color: #1f2937;
      font: 600 13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      height: 36px;
    }

    .rrp-pager button {
      cursor: pointer;
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
  `;

  let pager;
  let scheduled = false;
  const FILTER_PARAMS = ['sort', 'mode', 'nsfw'];

  addStyle(css);
  render();
  observe();
  patchHistory();
  document.addEventListener('click', normalizeLinkNavigation, true);
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
      label('第'),
      input(page),
      label('页'),
      button('跳转', () => goToPage(Number(pager.querySelector('input').value)))
    );
  }

  function pageButtons(page) {
    const nodes = [];
    const start = Math.max(1, page - 2);
    const end = page + 2;

    if (start > 1) {
      nodes.push(button('1', () => goToPage(1), page === 1));
      if (start > 2) nodes.push(label('…'));
    }

    for (let n = start; n <= end; n += 1) {
      const node = button(String(n), () => goToPage(n), n === page);
      if (n === page) node.classList.add('rrp-page-current');
      nodes.push(node);
    }

    nodes.push(label('…'));
    return nodes;
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
    return url.href;
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

  function scheduleRender() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
    });
  }

  function observe() {
    new MutationObserver(scheduleRender).observe(document.body, { childList: true, subtree: true });
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
