// ==UserScript==
// @name         RisuRealm Mobile Wrap Fix (Deprecated)
// @namespace    https://realm.risuai.net/
// @version      1.0.4
// @license      MIT
// @description  Deprecated: use RisuRealm UI Plus instead.
// @match        https://realm.risuai.net/*
// @icon         https://realm.risuai.net/favicon.ico
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const css = `
    html,
    body {
      max-width: 100% !important;
      overflow-x: hidden !important;
      overflow-x: clip !important;
    }

    body :where(p, li, a, pre, code),
    body :where(article, section, div, span):not(:has(img, video, canvas, svg)) {
      overflow-wrap: anywhere !important;
      word-break: break-word;
    }

    body :where(pre, code) {
      white-space: pre-wrap !important;
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).append(style);
})();
