//@name todown
//@display-name todown
//@api 3.0
//@version 1.0.0
//@description Always-visible jump-to-latest button for RISU AI
//@link https://unpkg.com/todown@1.0.0/dist/todown.js
var h = "todown", s = "todown-jump-button", x = "todown-at-bottom", E = "todown-pending", K = 8, j = 80, V = 300, W = 5, P = 48, z = 14, J = 1.2, Q = 56, Z = "todown-position", tt = "todown-position-mobile", et = 768, at = ".default-chat-screen", it = ".default-chat-screen > div.flex.flex-col-reverse", nt = ".default-chat-screen .risu-chat", rt = [
  ".default-chat-screen textarea",
  ".default-chat-screen [contenteditable]",
  ".default-chat-screen input[type='text']"
], U = "x-todown-jump", ot = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>', st = `.${s} {
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
.${s}:hover {
  background: rgba(39, 39, 42, 0.92);
}
.${s}:active {
  cursor: grabbing;
}
.${s}.${x} {
  opacity: 0.4;
}
.${s}.${E} {
  opacity: 0.25;
}
@media (max-width: 768px) {
  .${s} {
    width: 48px;
    height: 48px;
    left: 10px;
    bottom: calc(12px + env(safe-area-inset-bottom));
  }
}`, k = (a, i, n) => Math.min(Math.max(a, i), Math.max(i, n)), Y = async (a) => ({
  chatBody: await a.querySelector(it),
  first: await a.querySelector(nt)
}), lt = async (a) => {
  for (const i of rt) {
    const n = await a.querySelector(i);
    if (n === null) continue;
    const l = await n.getBoundingClientRect();
    if (l.height > 0) return l.height;
  }
  return Q;
}, L = (a) => a instanceof Error ? a.message : String(a), ct = async (a) => await a.clientWidth() <= et, ut = async (a) => {
  try {
    const i = await (await risuai.getLocalPluginStorage()).getItem(a);
    return i === null || typeof i != "object" || typeof i.x != "number" || typeof i.y != "number" || !Number.isFinite(i.x) || !Number.isFinite(i.y) ? null : {
      x: i.x,
      y: i.y
    };
  } catch (i) {
    return console.error(`[${h}] failed to load position: ${L(i)}`), null;
  }
}, dt = async (a, i) => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(a, i);
  } catch (n) {
    console.error(`[${h}] failed to save position: ${L(n)}`);
  }
}, wt = async () => {
  const a = await risuai.getRootDocument();
  if (a === null) {
    console.error(`[${h}] main document access denied or unavailable; grant permission and reload`);
    return;
  }
  if (await a.querySelector(`[${U}]`) !== null) return;
  const i = await a.querySelector("body");
  if (i === null) throw new Error("main document body not found");
  const n = await a.createElement("button");
  await n.addClass(s), await n.setAttribute(U, "1"), await n.setInnerHTML(ot);
  const l = await a.createElement("style");
  await l.setTextContent(st), await i.appendChild(l), await i.appendChild(n), await (await risuai.createMutationObserver(() => {
    F(!0);
  })).observe(i, {
    childList: !0,
    subtree: !0
  });
  let m = [];
  const _ = [];
  let v = !1, g = !1, b = !1, O = 0, y = null;
  const C = async (e, t) => {
    const r = await i.clientWidth(), o = await i.clientHeight();
    return {
      x: k(e, 0, Math.max(0, r - P)),
      y: k(t, 0, Math.max(0, o - P))
    };
  }, D = await lt(a);
  let d = z, w = Math.round(D * J);
  const B = async () => await ct(i) ? tt : Z, T = await ut(await B());
  if (T !== null) {
    const e = await C(T.x, T.y);
    d = e.x, w = e.y;
  }
  const I = async () => {
    await n.setStyle("left", `${d}px`), await n.setStyle("bottom", `${w}px`);
  };
  await I();
  const S = async (e) => {
    for (const t of e) await t.element.removeEventListener(t.type, t.id).catch(() => {
    });
    e.length = 0;
  }, f = async (e, t) => {
    const r = await n.addEventListener(e, t);
    _.push({
      element: n,
      type: e,
      id: r
    });
  }, X = async (e) => {
    await S(m);
    for (const t of e) {
      const r = await t.addEventListener("scroll", q);
      m.push({
        element: t,
        type: "scroll",
        id: r
      });
    }
  }, G = async (e, t) => {
    if (e !== null && t.first !== null) {
      const r = await e.getBoundingClientRect();
      let o = (await t.first.getBoundingClientRect()).bottom >= r.bottom - K;
      !o && t.chatBody !== null && (o = await t.chatBody.clientHeight() <= await e.clientHeight()), o !== v && (o ? await n.addClass(x) : await n.removeClass(x), v = o), await n.removeClass(E);
    } else
      v = !1, await n.addClass(E);
  }, p = async (e) => {
    if (g) {
      b = !0;
      return;
    }
    g = !0;
    try {
      const t = await a.querySelector(at), r = await Y(a);
      e && await X(t === null ? [] : [t]), await G(t, r);
    } catch (t) {
      console.error(`[${h}] refresh failed: ${L(t)}`);
    } finally {
      g = !1, b && (b = !1, p(!0));
    }
  }, q = () => {
    const e = Date.now();
    e - O < j || (O = e, p(!1));
  }, F = (e) => {
    y !== null && clearTimeout(y), y = setTimeout(() => {
      y = null, p(e);
    }, V);
  }, M = async (e) => {
    const t = e;
    if (typeof t.clientX != "number" || typeof t.clientY != "number") return !1;
    const r = await n.getBoundingClientRect();
    return t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom;
  };
  let c = !1, u = !1, R = 0, A = 0, N = 0, $ = 0;
  await f("pointerdown", (e) => {
    (async () => {
      if (!await M(e)) return;
      const t = e;
      c = !0, u = !1, R = t.clientX, A = t.clientY, N = d, $ = w;
    })();
  }), await f("pointermove", (e) => {
    (async () => {
      if (!c) return;
      const t = e;
      if (typeof t.clientX != "number" || typeof t.clientY != "number") return;
      const r = t.clientX - R, o = t.clientY - A;
      Math.abs(r) + Math.abs(o) > W && (u = !0);
      const H = await C(N + r, $ - o);
      d = H.x, w = H.y, await I();
    })();
  }), await f("pointerup", (e) => {
    (async () => c && (c = !1, u && await dt(await B(), {
      x: d,
      y: w
    })))();
  }), await f("pointercancel", (e) => {
    (async () => c && (c = !1, u = !1))();
  }), await f("click", (e) => {
    (async () => {
      if (u) {
        u = !1;
        return;
      }
      if (!await M(e)) return;
      const t = await Y(a);
      t.first !== null && (await t.first.scrollIntoView({
        behavior: "instant",
        block: "start"
      }), await p(!0));
    })();
  }), await risuai.onUnload(async () => {
    await S(_), await S(m), await n.remove().catch(() => {
    }), await l.remove().catch(() => {
    });
  }), await p(!0);
};
try {
  await wt();
} catch (a) {
  const i = a instanceof Error ? a.message : "Unknown error";
  console.error(`[${h}] initialization failed: ${i}`);
}
