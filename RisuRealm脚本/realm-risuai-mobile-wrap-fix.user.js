// ==UserScript==
// @name         RisuRealm Mobile Wrap Fix
// @namespace    https://realm.risuai.net/
// @version      1.0.2
// @license      MIT
// @description  Prevent long RisuRealm text and links from overflowing the mobile page width.
// @match        https://realm.risuai.net/*
// @icon         https://realm.risuai.net/favicon.ico
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const css = `
    @media (max-width: 760px) {
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
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).append(style);
})();
