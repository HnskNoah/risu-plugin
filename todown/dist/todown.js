//@name todown
//@display-name todown
//@api 3.0
//@version 1.0.0
//@description Always-visible jump-to-latest button for RISU AI
//@link https://unpkg.com/todown@1.0.0/dist/todown.js
var f = "todown", l = "todown-jump-button", S = "todown-at-bottom", x = "todown-pending", q = 8, F = 80, G = 300, j = 5, M = 48, z = 14, K = 1.2, V = 56, A = "todown-position", W = [".default-chat-screen"], J = ".default-chat-screen > div.flex.flex-col-reverse", Q = [".default-chat-screen .risu-chat"], Z = [
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
}`, R = (a, r, e) => Math.min(Math.max(a, r), Math.max(r, e)), at = async (a, r) => {
  for (const e of r) {
    const o = await a.querySelector(e);
    if (o !== null) return o;
  }
  return null;
}, $ = async (a) => {
  const r = await a.querySelector(J);
  for (const e of Q) {
    const o = await a.querySelectorAll(e);
    if (await o.length() > 0) return {
      chatBody: r,
      first: await o.at(0) ?? null
    };
  }
  return {
    chatBody: r,
    first: null
  };
}, it = async (a) => {
  for (const r of Z) {
    const e = await a.querySelector(r);
    if (e === null) continue;
    const o = await e.getBoundingClientRect();
    if (o.height > 0) return o.height;
  }
  return V;
}, rt = async () => {
  try {
    const a = await (await risuai.getLocalPluginStorage()).getItem(A);
    return a === null || typeof a != "object" || typeof a.x != "number" || typeof a.y != "number" || !Number.isFinite(a.x) || !Number.isFinite(a.y) ? null : {
      x: a.x,
      y: a.y
    };
  } catch (a) {
    const r = a instanceof Error ? a.message : String(a);
    return console.error(`[${f}] failed to load position: ${r}`), null;
  }
}, nt = async (a) => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(A, a);
  } catch (r) {
    const e = r instanceof Error ? r.message : String(r);
    console.error(`[${f}] failed to save position: ${e}`);
  }
}, ot = async () => {
  const a = await risuai.getRootDocument();
  if (await a.querySelector(`[${N}]`) !== null) return;
  const r = await a.querySelector("body");
  if (r === null) throw new Error("main document body not found");
  const e = await a.createElement("button");
  await e.addClass(l), await e.setAttribute(N, "1"), await e.setInnerHTML(tt);
  const o = await a.createElement("style");
  await o.setTextContent(et), await r.appendChild(o), await o.nodeName() !== "STYLE" && (await e.setStyle("position", "fixed"), await e.setStyle("left", "14px"), await e.setStyle("bottom", "67px"), await e.setStyle("z-index", "2147483000"), await e.setStyle("width", "44px"), await e.setStyle("height", "44px"), await e.setStyle("border-radius", "9999px"), await e.setStyle("background", "rgba(24, 24, 27, 0.85)"), await e.setStyle("color", "#e4e4e7"), await e.setStyle("cursor", "grab")), await r.appendChild(e), await (await risuai.createMutationObserver(() => {
    U(!0);
  })).observe(r, {
    childList: !0,
    subtree: !0
  });
  let h = [], m = !1, g = !1, b = !1, T = 0, p = null;
  const H = await it(a);
  let c = z, u = Math.round(H * K);
  const v = await rt();
  v !== null && (c = v.x, u = v.y);
  const E = async () => {
    await e.setStyle("left", `${c}px`), await e.setStyle("bottom", `${u}px`);
  };
  await E();
  const L = async () => {
    for (const i of h) await i.element.removeEventListener(i.type, i.id).catch(() => {
    });
    h = [];
  }, Y = async (i) => {
    await L();
    for (const t of i) {
      const n = await t.addEventListener("scroll", P);
      h.push({
        element: t,
        type: "scroll",
        id: n
      });
    }
  }, k = async (i, t) => {
    if (i !== null && t.first !== null) {
      const n = await i.getBoundingClientRect();
      let s = (await t.first.getBoundingClientRect()).bottom >= n.bottom - q;
      !s && t.chatBody !== null && (s = await t.chatBody.clientHeight() <= await i.clientHeight()), s !== m && (s ? await e.addClass(S) : await e.removeClass(S), m = s), await e.removeClass(x);
    } else
      m = !1, await e.addClass(x);
  }, d = async (i) => {
    if (g) {
      b = !0;
      return;
    }
    g = !0;
    try {
      const t = await at(a, W), n = await $(a);
      i && await Y(t === null ? [] : [t]), await k(t, n);
    } catch (t) {
      t instanceof Error && console.error(`[${f}] refresh failed: ${t.message}`);
    } finally {
      g = !1, b && (b = !1, d(!0));
    }
  }, P = () => {
    const i = Date.now();
    i - T < F || (T = i, d(!1));
  }, U = (i) => {
    p !== null && clearTimeout(p), p = setTimeout(() => {
      p = null, d(i);
    }, G);
  }, X = async (i) => {
    const t = i;
    if (typeof t.clientX != "number" || typeof t.clientY != "number") return !1;
    const n = await e.getBoundingClientRect();
    return t.clientX >= n.left && t.clientX <= n.right && t.clientY >= n.top && t.clientY <= n.bottom;
  }, D = async (i, t) => {
    const n = await r.clientWidth(), s = await r.clientHeight();
    return {
      x: R(i, 0, Math.max(0, n - M)),
      y: R(t, 0, Math.max(0, s - M))
    };
  };
  let y = !1, w = !1, C = 0, _ = 0, B = 0, O = 0;
  await e.addEventListener("pointerdown", (i) => {
    (async () => {
      if (!await X(i)) return;
      const t = i;
      y = !0, w = !1, C = Number(t.clientX), _ = Number(t.clientY), B = c, O = u;
    })();
  }), await e.addEventListener("pointermove", (i) => {
    (async () => {
      if (!y) return;
      const t = i;
      if (typeof t.clientX != "number" || typeof t.clientY != "number") return;
      const n = t.clientX - C, s = t.clientY - _;
      Math.abs(n) + Math.abs(s) > j && (w = !0);
      const I = await D(B + n, O - s);
      c = I.x, u = I.y, await E();
    })();
  }), await e.addEventListener("pointerup", (i) => {
    (async () => y && (y = !1, w && await nt({
      x: c,
      y: u
    })))();
  }), await e.addEventListener("click", (i) => {
    (async () => {
      if (w) {
        w = !1;
        return;
      }
      const t = i;
      if (typeof t.clientX != "number" || typeof t.clientY != "number") return;
      const n = await e.getBoundingClientRect();
      if (t.clientX < n.left || t.clientX > n.right || t.clientY < n.top || t.clientY > n.bottom) return;
      console.info(`[${f}] jump button clicked at (${t.clientX}, ${t.clientY})`);
      const s = await $(a);
      s.first !== null && (await s.first.scrollIntoView({
        behavior: "instant",
        block: "start"
      }), await d(!0));
    })();
  }), await risuai.onUnload(async () => {
    await L(), await e.remove().catch(() => {
    }), await o.remove().catch(() => {
    });
  }), await d(!0);
};
try {
  await ot();
} catch (a) {
  const r = a instanceof Error ? a.message : "Unknown error";
  console.error(`[${f}] initialization failed: ${r}`);
}
