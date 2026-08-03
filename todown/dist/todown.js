//@name todown
//@display-name todown
//@api 3.0
//@version 1.0.0
//@description Always-visible jump-to-latest button for RISU AI
//@link https://unpkg.com/todown@1.0.0/dist/todown.js
var c = "todown", l = "todown-jump-button", S = "todown-at-bottom", x = "todown-pending", q = 8, F = 80, G = 300, j = 5, M = 48, z = 14, K = 1.2, V = 56, H = "todown-position", W = [".default-chat-screen"], J = ".default-chat-screen > div.flex.flex-col-reverse", Q = [".default-chat-screen .risu-chat"], Z = [
  ".default-chat-screen textarea",
  ".default-chat-screen [contenteditable]",
  ".default-chat-screen input[type='text']"
], N = "x-todown-jump", tt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>', et = `.${l} {
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
}`, R = (a, i, e) => Math.min(Math.max(a, i), Math.max(i, e)), at = async (a, i) => {
  for (const e of i) {
    const o = await a.querySelector(e);
    if (o !== null) return o;
  }
  return null;
}, A = async (a) => {
  const i = await a.querySelector(J);
  for (const e of Q) {
    const o = await a.querySelectorAll(e);
    if (await o.length() > 0) return {
      chatBody: i,
      first: await o.at(0) ?? null
    };
  }
  return {
    chatBody: i,
    first: null
  };
}, rt = async (a) => {
  for (const i of Z) {
    const e = await a.querySelector(i);
    if (e === null) continue;
    const o = await e.getBoundingClientRect();
    if (o.height > 0) return o.height;
  }
  return V;
}, it = async () => {
  try {
    const a = await (await risuai.getLocalPluginStorage()).getItem(H);
    return a === null || typeof a != "object" || typeof a.x != "number" || typeof a.y != "number" || !Number.isFinite(a.x) || !Number.isFinite(a.y) ? null : {
      x: a.x,
      y: a.y
    };
  } catch (a) {
    const i = a instanceof Error ? a.message : String(a);
    return console.error(`[${c}] failed to load position: ${i}`), null;
  }
}, nt = async (a) => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(H, a);
  } catch (i) {
    const e = i instanceof Error ? i.message : String(i);
    console.error(`[${c}] failed to save position: ${e}`);
  }
}, ot = async () => {
  const a = await risuai.getRootDocument();
  if (a === null) {
    console.error(`[${c}] main document access denied or unavailable; grant permission and reload`);
    return;
  }
  if (await a.querySelector(`[${N}]`) !== null) return;
  const i = await a.querySelector("body");
  if (i === null) throw new Error("main document body not found");
  const e = await a.createElement("button");
  await e.addClass(l), await e.setAttribute(N, "1"), await e.setInnerHTML(tt);
  const o = await a.createElement("style");
  await o.setTextContent(et), await i.appendChild(o), await o.nodeName() !== "STYLE" && (await e.setStyle("position", "fixed"), await e.setStyle("left", "14px"), await e.setStyle("bottom", "67px"), await e.setStyle("z-index", "2147483000"), await e.setStyle("width", "44px"), await e.setStyle("height", "44px"), await e.setStyle("border-radius", "9999px"), await e.setStyle("background", "rgba(24, 24, 27, 0.85)"), await e.setStyle("color", "#e4e4e7"), await e.setStyle("cursor", "grab")), await i.appendChild(e), await (await risuai.createMutationObserver(() => {
    X(!0);
  })).observe(i, {
    childList: !0,
    subtree: !0
  });
  let h = [], m = !1, g = !1, b = !1, T = 0, p = null;
  const E = async (r, t) => {
    const n = await i.clientWidth(), s = await i.clientHeight();
    return {
      x: R(r, 0, Math.max(0, n - M)),
      y: R(t, 0, Math.max(0, s - M))
    };
  }, Y = await rt(a);
  let u = z, d = Math.round(Y * K);
  const v = await it();
  if (v !== null) {
    const r = await E(v.x, v.y);
    u = r.x, d = r.y;
  }
  const L = async () => {
    await e.setStyle("left", `${u}px`), await e.setStyle("bottom", `${d}px`);
  };
  await L();
  const C = async () => {
    for (const r of h) await r.element.removeEventListener(r.type, r.id).catch(() => {
    });
    h = [];
  }, k = async (r) => {
    await C();
    for (const t of r) {
      const n = await t.addEventListener("scroll", U);
      h.push({
        element: t,
        type: "scroll",
        id: n
      });
    }
  }, P = async (r, t) => {
    if (r !== null && t.first !== null) {
      const n = await r.getBoundingClientRect();
      let s = (await t.first.getBoundingClientRect()).bottom >= n.bottom - q;
      !s && t.chatBody !== null && (s = await t.chatBody.clientHeight() <= await r.clientHeight()), s !== m && (s ? await e.addClass(S) : await e.removeClass(S), m = s), await e.removeClass(x);
    } else
      m = !1, await e.addClass(x);
  }, w = async (r) => {
    if (g) {
      b = !0;
      return;
    }
    g = !0;
    try {
      const t = await at(a, W), n = await A(a);
      r && await k(t === null ? [] : [t]), await P(t, n);
    } catch (t) {
      t instanceof Error && console.error(`[${c}] refresh failed: ${t.message}`);
    } finally {
      g = !1, b && (b = !1, w(!0));
    }
  }, U = () => {
    const r = Date.now();
    r - T < F || (T = r, w(!1));
  }, X = (r) => {
    p !== null && clearTimeout(p), p = setTimeout(() => {
      p = null, w(r);
    }, G);
  }, D = async (r) => {
    const t = r;
    if (typeof t.clientX != "number" || typeof t.clientY != "number") return !1;
    const n = await e.getBoundingClientRect();
    return t.clientX >= n.left && t.clientX <= n.right && t.clientY >= n.top && t.clientY <= n.bottom;
  };
  let y = !1, f = !1, _ = 0, B = 0, O = 0, $ = 0;
  await e.addEventListener("pointerdown", (r) => {
    (async () => {
      if (!await D(r)) return;
      const t = r;
      y = !0, f = !1, _ = Number(t.clientX), B = Number(t.clientY), O = u, $ = d;
    })();
  }), await e.addEventListener("pointermove", (r) => {
    (async () => {
      if (!y) return;
      const t = r;
      if (typeof t.clientX != "number" || typeof t.clientY != "number") return;
      const n = t.clientX - _, s = t.clientY - B;
      Math.abs(n) + Math.abs(s) > j && (f = !0);
      const I = await E(O + n, $ - s);
      u = I.x, d = I.y, await L();
    })();
  }), await e.addEventListener("pointerup", (r) => {
    (async () => y && (y = !1, f && await nt({
      x: u,
      y: d
    })))();
  }), await e.addEventListener("click", (r) => {
    (async () => {
      if (f) {
        f = !1;
        return;
      }
      const t = r;
      if (typeof t.clientX != "number" || typeof t.clientY != "number") return;
      const n = await e.getBoundingClientRect();
      if (t.clientX < n.left || t.clientX > n.right || t.clientY < n.top || t.clientY > n.bottom) return;
      console.info(`[${c}] jump button clicked at (${t.clientX}, ${t.clientY})`);
      const s = await A(a);
      s.first !== null && (await s.first.scrollIntoView({
        behavior: "instant",
        block: "start"
      }), await w(!0));
    })();
  }), await risuai.onUnload(async () => {
    await C(), await e.remove().catch(() => {
    }), await o.remove().catch(() => {
    });
  }), await w(!0);
};
try {
  await ot();
} catch (a) {
  const i = a instanceof Error ? a.message : "Unknown error";
  console.error(`[${c}] initialization failed: ${i}`);
}
