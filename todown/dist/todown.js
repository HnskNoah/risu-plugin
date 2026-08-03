//@name todown
//@display-name todown
//@api 3.0
//@version 1.0.0
//@description Always-visible jump-to-latest button for RISU AI
//@link https://unpkg.com/todown@1.0.0/dist/todown.js
var d = "todown", l = "todown-jump-button", x = "todown-at-bottom", E = "todown-pending", V = 8, W = 80, J = 300, Q = 5, A = 48, Z = 14, tt = 1.2, et = 56, $ = "todown-position", P = "todown-position-mobile", at = 768, nt = [".default-chat-screen"], it = ".default-chat-screen > div.flex.flex-col-reverse", rt = [".default-chat-screen .risu-chat"], ot = [
  ".default-chat-screen textarea",
  ".default-chat-screen [contenteditable]",
  ".default-chat-screen input[type='text']"
], Y = "x-todown-jump", st = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>', lt = `.${l} {
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
.${l}.${x} {
  opacity: 0.4;
}
.${l}.${E} {
  opacity: 0.25;
}
@media (max-width: 768px) {
  .${l} {
    width: 48px;
    height: 48px;
    left: 10px;
    bottom: calc(12px + env(safe-area-inset-bottom));
  }
}`, H = (i, n, t) => Math.min(Math.max(i, n), Math.max(n, t)), ct = async (i, n) => {
  for (const t of n) {
    const o = await i.querySelector(t);
    if (o !== null) return o;
  }
  return null;
}, k = async (i) => {
  const n = await i.querySelector(it);
  for (const t of rt) {
    const o = await i.querySelectorAll(t);
    if (await o.length() > 0) return {
      chatBody: n,
      first: await o.at(0) ?? null
    };
  }
  return {
    chatBody: n,
    first: null
  };
}, ut = async (i) => {
  for (const n of ot) {
    const t = await i.querySelector(n);
    if (t === null) continue;
    const o = await t.getBoundingClientRect();
    if (o.height > 0) return o.height;
  }
  return et;
}, U = async (i) => await i.clientWidth() <= at, dt = async (i) => {
  try {
    const n = await (await risuai.getLocalPluginStorage()).getItem(i);
    return n === null || typeof n != "object" || typeof n.x != "number" || typeof n.y != "number" || !Number.isFinite(n.x) || !Number.isFinite(n.y) ? null : {
      x: n.x,
      y: n.y
    };
  } catch (n) {
    const t = n instanceof Error ? n.message : String(n);
    return console.error(`[${d}] failed to load position: ${t}`), null;
  }
}, wt = async (i, n) => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(i, n);
  } catch (t) {
    const o = t instanceof Error ? t.message : String(t);
    console.error(`[${d}] failed to save position: ${o}`);
  }
}, ft = async () => {
  const i = await risuai.getRootDocument();
  if (i === null) {
    console.error(`[${d}] main document access denied or unavailable; grant permission and reload`);
    return;
  }
  if (await i.querySelector(`[${Y}]`) !== null) return;
  const n = await i.querySelector("body");
  if (n === null) throw new Error("main document body not found");
  const t = await i.createElement("button");
  await t.addClass(l), await t.setAttribute(Y, "1"), await t.setInnerHTML(st);
  const o = await i.createElement("style");
  await o.setTextContent(lt), await n.appendChild(o), await o.nodeName() !== "STYLE" && (await t.setStyle("position", "fixed"), await t.setStyle("left", "14px"), await t.setStyle("bottom", "67px"), await t.setStyle("z-index", "2147483000"), await t.setStyle("width", "44px"), await t.setStyle("height", "44px"), await t.setStyle("border-radius", "9999px"), await t.setStyle("background", "rgba(24, 24, 27, 0.85)"), await t.setStyle("color", "#e4e4e7"), await t.setStyle("cursor", "grab")), await n.appendChild(t), await (await risuai.createMutationObserver(() => {
    j(!0);
  })).observe(n, {
    childList: !0,
    subtree: !0
  });
  let m = [];
  const T = [];
  let h = !1, g = !1, v = !1, L = 0, y = null;
  const _ = async (a, e) => {
    const r = await n.clientWidth(), s = await n.clientHeight();
    return {
      x: H(a, 0, Math.max(0, r - A)),
      y: H(e, 0, Math.max(0, s - A))
    };
  }, X = await ut(i);
  let w = Z, f = Math.round(X * tt);
  const q = await U(n) ? P : $, b = await dt(q);
  if (b !== null) {
    const a = await _(b.x, b.y);
    w = a.x, f = a.y;
  }
  const O = async () => {
    await t.setStyle("left", `${w}px`), await t.setStyle("bottom", `${f}px`);
  };
  await O();
  const C = async () => {
    for (const a of m) await a.element.removeEventListener(a.type, a.id).catch(() => {
    });
    m = [];
  }, D = async () => {
    for (const a of T) await a.element.removeEventListener(a.type, a.id).catch(() => {
    });
    T.length = 0;
  }, F = async (a) => {
    await C();
    for (const e of a) {
      const r = await e.addEventListener("scroll", K);
      m.push({
        element: e,
        type: "scroll",
        id: r
      });
    }
  }, G = async (a, e) => {
    if (a !== null && e.first !== null) {
      const r = await a.getBoundingClientRect();
      let s = (await e.first.getBoundingClientRect()).bottom >= r.bottom - V;
      !s && e.chatBody !== null && (s = await e.chatBody.clientHeight() <= await a.clientHeight()), s !== h && (s ? await t.addClass(x) : await t.removeClass(x), h = s), await t.removeClass(E);
    } else
      h = !1, await t.addClass(E);
  }, p = async (a) => {
    if (g) {
      v = !0;
      return;
    }
    g = !0;
    try {
      const e = await ct(i, nt), r = await k(i);
      a && await F(e === null ? [] : [e]), await G(e, r);
    } catch (e) {
      e instanceof Error && console.error(`[${d}] refresh failed: ${e.message}`);
    } finally {
      g = !1, v && (v = !1, p(!0));
    }
  }, K = () => {
    const a = Date.now();
    a - L < W || (L = a, p(!1));
  }, j = (a) => {
    y !== null && clearTimeout(y), y = setTimeout(() => {
      y = null, p(a);
    }, J);
  }, z = async (a) => {
    const e = a;
    if (typeof e.clientX != "number" || typeof e.clientY != "number") return !1;
    const r = await t.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  let c = !1, u = !1, B = 0, I = 0, M = 0, N = 0, S = !1;
  await t.addEventListener("pointerdown", (a) => {
    (async () => {
      if (!await z(a)) return;
      const e = a;
      c = !0, u = !1, B = Number(e.clientX), I = Number(e.clientY), M = w, N = f;
    })();
  }), await t.addEventListener("pointermove", (a) => {
    (async () => {
      if (!c) return;
      const e = a;
      if (typeof e.clientX != "number" || typeof e.clientY != "number") return;
      const r = e.clientX - B, s = e.clientY - I;
      Math.abs(r) + Math.abs(s) > Q && (u = !0);
      const R = await _(M + r, N - s);
      w = R.x, f = R.y, S || (S = !0, requestAnimationFrame(() => {
        S = !1, O();
      }));
    })();
  }), await t.addEventListener("pointerup", (a) => {
    (async () => {
      if (c && (c = !1, u)) {
        const e = await U(n) ? P : $;
        await wt(e, {
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
      const s = await k(i);
      s.first !== null && (await s.first.scrollIntoView({
        behavior: "instant",
        block: "start"
      }), await p(!0));
    })();
  }), await risuai.onUnload(async () => {
    await D(), await C(), await t.remove().catch(() => {
    }), await o.remove().catch(() => {
    });
  }), await p(!0);
};
try {
  await ft();
} catch (i) {
  const n = i instanceof Error ? i.message : "Unknown error";
  console.error(`[${d}] initialization failed: ${n}`);
}
