// ==UserScript==
// @name         RisuRealm Mobile Wrap Fix
// @namespace    https://realm.risuai.net/
// @version      1.0.0
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

      body * {
        box-sizing: border-box;
        min-width: 0 !important;
      }

      body :where(article, section, div, p, li, span, a, pre, code) {
        overflow-wrap: anywhere !important;
        word-break: break-word;
      }

      body :where(pre, code) {
        white-space: pre-wrap !important;
      }

      body :where(img, video, canvas, svg) {
        max-width: 100% !important;
      }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).append(style);
})();
