//@name todown
//@display-name todown
//@api 3.0
//@version 1.0.0
//@description Always-visible jump-to-latest button for RISU AI
//@link https://unpkg.com/todown@1.0.0/dist/todown.js
var c = "todown", l = "todown-jump-button", S = "todown-at-bottom", x = "todown-pending", K = 8, j = 80, z = 300, V = 5, N = 48, W = 14, J = 1.2, Q = 56, R = "todown-position", $ = "todown-position-mobile", Z = 768, tt = [".default-chat-screen"], et = ".default-chat-screen > div.flex.flex-col-reverse", at = [".default-chat-screen .risu-chat"], it = [
  ".default-chat-screen textarea",
  ".default-chat-screen [contenteditable]",
  ".default-chat-screen input[type='text']"
], A = "x-todown-jump", rt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>', nt = `.${l} {
  position: fixed;
  left: 14px;
  bottom: 67px;
  z-index: 2147483000;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 9999px;
  border: 1px solid rgba(128, 128, 128, 0.35);
  background: rgba(24, 24, 27, 0.85);
  color: #e4e4e7;
  cursor: grab;
  touch-action: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  opacity: 1;
  transition: opacity 0.18s ease;
}
.${l}:hover {
  background: rgba(39, 39, 42, 0.92);
}
.${l}:active {
  cursor: grabbing;
}
.${l}.${S} {
  opacity: 0.4;
}
.${l}.${x} {
  opacity: 0.25;
}
@media (max-width: 768px) {
  .${l} {
    width: 48px;
    height: 48px;
    left: 10px;
    bottom: calc(12px + env(safe-area-inset-bottom));
  }
}`, Y = (r, a, t) => Math.min(Math.max(r, a), Math.max(a, t)), ot = async (r, a) => {
  for (const t of a) {
    const o = await r.querySelector(t);
    if (o !== null) return o;
  }
  return null;
}, H = async (r) => {
  const a = await r.querySelector(et);
  for (const t of at) {
    const o = await r.querySelectorAll(t);
    if (await o.length() > 0) return {
      chatBody: a,
      first: await o.at(0) ?? null
    };
  }
  return {
    chatBody: a,
    first: null
  };
}, st = async (r) => {
  for (const a of it) {
    const t = await r.querySelector(a);
    if (t === null) continue;
    const o = await t.getBoundingClientRect();
    if (o.height > 0) return o.height;
  }
  return Q;
}, P = async (r) => await r.clientWidth() <= Z, lt = async (r) => {
  try {
    const a = await (await risuai.getLocalPluginStorage()).getItem(r);
    return a === null || typeof a != "object" || typeof a.x != "number" || typeof a.y != "number" || !Number.isFinite(a.x) || !Number.isFinite(a.y) ? null : {
      x: a.x,
      y: a.y
    };
  } catch (a) {
    const t = a instanceof Error ? a.message : String(a);
    return console.error(`[${c}] failed to load position: ${t}`), null;
  }
}, ct = async (r, a) => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(r, a);
  } catch (t) {
    const o = t instanceof Error ? t.message : String(t);
    console.error(`[${c}] failed to save position: ${o}`);
  }
}, ut = async () => {
  const r = await risuai.getRootDocument();
  if (r === null) {
    console.error(`[${c}] main document access denied or unavailable; grant permission and reload`);
    return;
  }
  if (await r.querySelector(`[${A}]`) !== null) return;
  const a = await r.querySelector("body");
  if (a === null) throw new Error("main document body not found");
  const t = await r.createElement("button");
  await t.addClass(l), await t.setAttribute(A, "1"), await t.setInnerHTML(rt);
  const o = await r.createElement("style");
  await o.setTextContent(nt), await a.appendChild(o), await o.nodeName() !== "STYLE" && (await t.setStyle("position", "fixed"), await t.setStyle("left", "14px"), await t.setStyle("bottom", "67px"), await t.setStyle("z-index", "2147483000"), await t.setStyle("width", "44px"), await t.setStyle("height", "44px"), await t.setStyle("border-radius", "9999px"), await t.setStyle("background", "rgba(24, 24, 27, 0.85)"), await t.setStyle("color", "#e4e4e7"), await t.setStyle("cursor", "grab")), await a.appendChild(t), await (await risuai.createMutationObserver(() => {
    G(!0);
  })).observe(a, {
    childList: !0,
    subtree: !0
  });
  let h = [], m = !1, g = !1, v = !1, E = 0, p = null;
  const T = async (i, e) => {
    const n = await a.clientWidth(), s = await a.clientHeight();
    return {
      x: Y(i, 0, Math.max(0, n - N)),
      y: Y(e, 0, Math.max(0, s - N))
    };
  }, k = await st(r);
  let u = W, d = Math.round(k * J);
  const U = await P(a) ? $ : R, b = await lt(U);
  if (b !== null) {
    const i = await T(b.x, b.y);
    u = i.x, d = i.y;
  }
  const L = async () => {
    await t.setStyle("left", `${u}px`), await t.setStyle("bottom", `${d}px`);
  };
  await L();
  const _ = async () => {
    for (const i of h) await i.element.removeEventListener(i.type, i.id).catch(() => {
    });
    h = [];
  }, X = async (i) => {
    await _();
    for (const e of i) {
      const n = await e.addEventListener("scroll", q);
      h.push({
        element: e,
        type: "scroll",
        id: n
      });
    }
  }, D = async (i, e) => {
    if (i !== null && e.first !== null) {
      const n = await i.getBoundingClientRect();
      let s = (await e.first.getBoundingClientRect()).bottom >= n.bottom - K;
      !s && e.chatBody !== null && (s = await e.chatBody.clientHeight() <= await i.clientHeight()), s !== m && (s ? await t.addClass(S) : await t.removeClass(S), m = s), await t.removeClass(x);
    } else
      m = !1, await t.addClass(x);
  }, w = async (i) => {
    if (g) {
      v = !0;
      return;
    }
    g = !0;
    try {
      const e = await ot(r, tt), n = await H(r);
      i && await X(e === null ? [] : [e]), await D(e, n);
    } catch (e) {
      e instanceof Error && console.error(`[${c}] refresh failed: ${e.message}`);
    } finally {
      g = !1, v && (v = !1, w(!0));
    }
  }, q = () => {
    const i = Date.now();
    i - E < j || (E = i, w(!1));
  }, G = (i) => {
    p !== null && clearTimeout(p), p = setTimeout(() => {
      p = null, w(i);
    }, z);
  }, F = async (i) => {
    const e = i;
    if (typeof e.clientX != "number" || typeof e.clientY != "number") return !1;
    const n = await t.getBoundingClientRect();
    return e.clientX >= n.left && e.clientX <= n.right && e.clientY >= n.top && e.clientY <= n.bottom;
  };
  let y = !1, f = !1, O = 0, C = 0, B = 0, I = 0;
  await t.addEventListener("pointerdown", (i) => {
    (async () => {
      if (!await F(i)) return;
      const e = i;
      y = !0, f = !1, O = Number(e.clientX), C = Number(e.clientY), B = u, I = d;
    })();
  }), await t.addEventListener("pointermove", (i) => {
    (async () => {
      if (!y) return;
      const e = i;
      if (typeof e.clientX != "number" || typeof e.clientY != "number") return;
      const n = e.clientX - O, s = e.clientY - C;
      Math.abs(n) + Math.abs(s) > V && (f = !0);
      const M = await T(B + n, I - s);
      u = M.x, d = M.y, await L();
    })();
  }), await t.addEventListener("pointerup", (i) => {
    (async () => {
      if (y && (y = !1, f)) {
        const e = await P(a) ? $ : R;
        await ct(e, {
          x: u,
          y: d
        });
      }
    })();
  }), await t.addEventListener("click", (i) => {
    (async () => {
      if (f) {
        f = !1;
        return;
      }
      const e = i;
      if (typeof e.clientX != "number" || typeof e.clientY != "number") return;
      const n = await t.getBoundingClientRect();
      if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) return;
      console.info(`[${c}] jump button clicked at (${e.clientX}, ${e.clientY})`);
      const s = await H(r);
      s.first !== null && (await s.first.scrollIntoView({
        behavior: "instant",
        block: "start"
      }), await w(!0));
    })();
  }), await risuai.onUnload(async () => {
    await _(), await t.remove().catch(() => {
    }), await o.remove().catch(() => {
    });
  }), await w(!0);
};
try {
  await ut();
} catch (r) {
  const a = r instanceof Error ? r.message : "Unknown error";
  console.error(`[${c}] initialization failed: ${a}`);
}
