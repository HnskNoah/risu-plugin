//@name todown
//@display-name todown
//@api 3.0
//@version 1.0.0
//@description Always-visible jump-to-latest button for RISU AI
//@link https://unpkg.com/todown@1.0.0/dist/todown.js
var d = "todown", l = "todown-jump-button", S = "todown-at-bottom", x = "todown-pending", z = 8, V = 80, W = 300, J = 5, R = 48, Q = 14, Z = 1.2, tt = 56, $ = "todown-position", A = "todown-position-mobile", et = 768, at = [".default-chat-screen"], it = ".default-chat-screen > div.flex.flex-col-reverse", nt = [".default-chat-screen .risu-chat"], rt = [
  ".default-chat-screen textarea",
  ".default-chat-screen [contenteditable]",
  ".default-chat-screen input[type='text']"
], Y = "x-todown-jump", ot = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>', st = `.${l} {
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
}`, H = (n, i, t) => Math.min(Math.max(n, i), Math.max(i, t)), lt = async (n, i) => {
  for (const t of i) {
    const o = await n.querySelector(t);
    if (o !== null) return o;
  }
  return null;
}, P = async (n) => {
  const i = await n.querySelector(it);
  for (const t of nt) {
    const o = await n.querySelectorAll(t);
    if (await o.length() > 0) return {
      chatBody: i,
      first: await o.at(0) ?? null
    };
  }
  return {
    chatBody: i,
    first: null
  };
}, ct = async (n) => {
  for (const i of rt) {
    const t = await n.querySelector(i);
    if (t === null) continue;
    const o = await t.getBoundingClientRect();
    if (o.height > 0) return o.height;
  }
  return tt;
}, k = async (n) => await n.clientWidth() <= et, ut = async (n) => {
  try {
    const i = await (await risuai.getLocalPluginStorage()).getItem(n);
    return i === null || typeof i != "object" || typeof i.x != "number" || typeof i.y != "number" || !Number.isFinite(i.x) || !Number.isFinite(i.y) ? null : {
      x: i.x,
      y: i.y
    };
  } catch (i) {
    const t = i instanceof Error ? i.message : String(i);
    return console.error(`[${d}] failed to load position: ${t}`), null;
  }
}, dt = async (n, i) => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(n, i);
  } catch (t) {
    const o = t instanceof Error ? t.message : String(t);
    console.error(`[${d}] failed to save position: ${o}`);
  }
}, wt = async () => {
  const n = await risuai.getRootDocument();
  if (n === null) {
    console.error(`[${d}] main document access denied or unavailable; grant permission and reload`);
    return;
  }
  if (await n.querySelector(`[${Y}]`) !== null) return;
  const i = await n.querySelector("body");
  if (i === null) throw new Error("main document body not found");
  const t = await n.createElement("button");
  await t.addClass(l), await t.setAttribute(Y, "1"), await t.setInnerHTML(ot);
  const o = await n.createElement("style");
  await o.setTextContent(st), await i.appendChild(o), await o.nodeName() !== "STYLE" && (await t.setStyle("position", "fixed"), await t.setStyle("left", "14px"), await t.setStyle("bottom", "67px"), await t.setStyle("z-index", "2147483000"), await t.setStyle("width", "44px"), await t.setStyle("height", "44px"), await t.setStyle("border-radius", "9999px"), await t.setStyle("background", "rgba(24, 24, 27, 0.85)"), await t.setStyle("color", "#e4e4e7"), await t.setStyle("cursor", "grab")), await i.appendChild(t), await (await risuai.createMutationObserver(() => {
    K(!0);
  })).observe(i, {
    childList: !0,
    subtree: !0
  });
  let h = [];
  const E = [];
  let m = !1, v = !1, g = !1, T = 0, y = null;
  const L = async (a, e) => {
    const r = await i.clientWidth(), s = await i.clientHeight();
    return {
      x: H(a, 0, Math.max(0, r - R)),
      y: H(e, 0, Math.max(0, s - R))
    };
  }, U = await ct(n);
  let w = Q, f = Math.round(U * Z);
  const X = await k(i) ? A : $, b = await ut(X);
  if (b !== null) {
    const a = await L(b.x, b.y);
    w = a.x, f = a.y;
  }
  const _ = async () => {
    await t.setStyle("left", `${w}px`), await t.setStyle("bottom", `${f}px`);
  };
  await _();
  const O = async () => {
    for (const a of h) await a.element.removeEventListener(a.type, a.id).catch(() => {
    });
    h = [];
  }, D = async () => {
    for (const a of E) await a.element.removeEventListener(a.type, a.id).catch(() => {
    });
    E.length = 0;
  }, q = async (a) => {
    await O();
    for (const e of a) {
      const r = await e.addEventListener("scroll", F);
      h.push({
        element: e,
        type: "scroll",
        id: r
      });
    }
  }, G = async (a, e) => {
    if (a !== null && e.first !== null) {
      const r = await a.getBoundingClientRect();
      let s = (await e.first.getBoundingClientRect()).bottom >= r.bottom - z;
      !s && e.chatBody !== null && (s = await e.chatBody.clientHeight() <= await a.clientHeight()), s !== m && (s ? await t.addClass(S) : await t.removeClass(S), m = s), await t.removeClass(x);
    } else
      m = !1, await t.addClass(x);
  }, p = async (a) => {
    if (v) {
      g = !0;
      return;
    }
    v = !0;
    try {
      const e = await lt(n, at), r = await P(n);
      a && await q(e === null ? [] : [e]), await G(e, r);
    } catch (e) {
      e instanceof Error && console.error(`[${d}] refresh failed: ${e.message}`);
    } finally {
      v = !1, g && (g = !1, p(!0));
    }
  }, F = () => {
    const a = Date.now();
    a - T < V || (T = a, p(!1));
  }, K = (a) => {
    y !== null && clearTimeout(y), y = setTimeout(() => {
      y = null, p(a);
    }, W);
  }, j = async (a) => {
    const e = a;
    if (typeof e.clientX != "number" || typeof e.clientY != "number") return !1;
    const r = await t.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  let c = !1, u = !1, C = 0, B = 0, I = 0, M = 0;
  await t.addEventListener("pointerdown", (a) => {
    (async () => {
      if (!await j(a)) return;
      const e = a;
      c = !0, u = !1, C = Number(e.clientX), B = Number(e.clientY), I = w, M = f;
    })();
  }), await t.addEventListener("pointermove", (a) => {
    (async () => {
      if (!c) return;
      const e = a;
      if (typeof e.clientX != "number" || typeof e.clientY != "number") return;
      const r = e.clientX - C, s = e.clientY - B;
      Math.abs(r) + Math.abs(s) > J && (u = !0);
      const N = await L(I + r, M - s);
      w = N.x, f = N.y, await _();
    })();
  }), await t.addEventListener("pointerup", (a) => {
    (async () => {
      if (c && (c = !1, u)) {
        const e = await k(i) ? A : $;
        await dt(e, {
          x: w,
          y: f
        });
      }
    })();
  }), await t.addEventListener("pointercancel", (a) => {
    (async () => c && (c = !1, u = !1))();
  }), await t.addEventListener("click", (a) => {
    (async () => {
      if (u) {
        u = !1;
        return;
      }
      const e = a;
      if (typeof e.clientX != "number" || typeof e.clientY != "number") return;
      const r = await t.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      console.info(`[${d}] jump button clicked at (${e.clientX}, ${e.clientY})`);
      const s = await P(n);
      s.first !== null && (await s.first.scrollIntoView({
        behavior: "instant",
        block: "start"
      }), await p(!0));
    })();
  }), await risuai.onUnload(async () => {
    await D(), await O(), await t.remove().catch(() => {
    }), await o.remove().catch(() => {
    });
  }), await p(!0);
};
try {
  await wt();
} catch (n) {
  const i = n instanceof Error ? n.message : "Unknown error";
  console.error(`[${d}] initialization failed: ${i}`);
}
