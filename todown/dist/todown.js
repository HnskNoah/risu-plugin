//@name todown
//@display-name todown
//@api 3.0
//@version 1.0.0
//@description Always-visible jump-to-latest button for RISU AI
//@link https://github.com/HnskNoah/risu-plugin/blob/main/todown/dist/todown.js
var s = "todown", u = "todown-jump-button", L = "todown-at-bottom", B = "todown-pending", st = 100, lt = 80, ct = 300, ut = 5, q = 48, wt = 14, dt = 1.2, ft = 56, mt = "todown-position", vt = "todown-position-mobile", pt = 768, yt = 4e3, ht = 100, gt = 100, J = "todown-activate", W = "2026-08-main-dom-v1", A = "todown-main-dom-permission-version", Tt = ".default-chat-screen", bt = ".default-chat-screen > div.flex.flex-col-reverse", St = ".default-chat-screen .risu-chat", _t = [
  ".default-chat-screen textarea",
  ".default-chat-screen [contenteditable]",
  ".default-chat-screen input[type='text']"
], F = "x-todown-jump", Q = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>', Et = `.${u} {
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
.${u}:hover {
  background: rgba(39, 39, 42, 0.92);
}
.${u}:active {
  cursor: grabbing;
}
.${u}.${L} {
  opacity: 0.4;
}
.${u}.${B} {
  opacity: 0.25;
}
@media (max-width: 768px) {
  .${u} {
    width: 48px;
    height: 48px;
    left: 10px;
    bottom: calc(12px + env(safe-area-inset-bottom));
  }
}`, K = (t, a, i) => Math.min(Math.max(t, a), Math.max(a, i)), V = async (t) => ({
  chatBody: await t.querySelector(bt),
  first: await t.querySelector(St)
}), Ot = async (t) => {
  for (const a of _t) {
    const i = await t.querySelector(a);
    if (i === null) continue;
    const n = await i.getBoundingClientRect();
    if (n.height > 0) return n.height;
  }
  return ft;
}, c = (t) => t instanceof Error ? t.message : String(t), Z = (t) => new Promise((a) => setTimeout(a, t)), xt = async () => {
  try {
    return await risuai.getRootDocument();
  } catch (t) {
    return console.error(`[${s}] failed to get root document: ${c(t)}`), null;
  }
}, It = async (t) => {
  for (let a = 0; a < gt; a += 1) {
    const i = await t.querySelector("body");
    if (i !== null) return i;
    await Z(ht);
  }
  return null;
}, Mt = async (t) => await t.clientWidth() <= pt, Lt = async (t) => {
  try {
    const a = await (await risuai.getLocalPluginStorage()).getItem(t);
    return a === null || typeof a != "object" || typeof a.x != "number" || typeof a.y != "number" || !Number.isFinite(a.x) || !Number.isFinite(a.y) ? null : {
      x: a.x,
      y: a.y
    };
  } catch (a) {
    return console.error(`[${s}] failed to load position: ${c(a)}`), null;
  }
}, Bt = async (t, a) => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(t, a);
  } catch (i) {
    console.error(`[${s}] failed to save position: ${c(i)}`);
  }
}, Rt = async () => {
  try {
    return await (await risuai.getLocalPluginStorage()).getItem(A) === W;
  } catch (t) {
    return console.error(`[${s}] failed to load main DOM permission marker: ${c(t)}`), !1;
  }
}, j = async () => {
  try {
    await (await risuai.getLocalPluginStorage()).setItem(A, W);
  } catch (t) {
    console.error(`[${s}] failed to save main DOM permission marker: ${c(t)}`);
  }
}, R = async () => {
  try {
    await (await risuai.getLocalPluginStorage()).removeItem(A);
  } catch (t) {
    console.error(`[${s}] failed to clear main DOM permission marker: ${c(t)}`);
  }
}, y = null, g = !1, T = null, b = !1, At = async (t) => {
  const a = await xt();
  if (a === null)
    return console.error(`[${s}] main document access denied or unavailable; use the ToDown button after the page finishes loading`), t === "auto" && await R(), !1;
  if (await a.querySelector(`[${F}]`) !== null)
    return g = !0, await j(), !0;
  const i = await It(a);
  if (i === null)
    throw t === "auto" && await R(), new Error("main document body not found after waiting");
  const n = await a.createElement("button");
  await n.addClass(u), await n.setAttribute(F, "1"), await n.setInnerHTML(Q);
  const S = await a.createElement("style");
  await S.setTextContent(Et), await i.appendChild(S), await i.appendChild(n), await (await risuai.createMutationObserver(() => {
    ot(!0);
  })).observe(i, {
    childList: !0,
    subtree: !0
  });
  let _ = [];
  const $ = [];
  let E = !1, O = !1, x = !1, C = 0, h = null;
  const N = async (e, r) => {
    const o = await i.clientWidth(), l = await i.clientHeight();
    return {
      x: K(e, 0, Math.max(0, o - q)),
      y: K(r, 0, Math.max(0, l - q))
    };
  }, at = await Ot(a);
  let f = wt, m = Math.round(at * dt);
  const D = async () => await Mt(i) ? vt : mt, I = await Lt(await D());
  if (I !== null) {
    const e = await N(I.x, I.y);
    f = e.x, m = e.y;
  }
  const P = async () => {
    await n.setStyle("left", `${f}px`), await n.setStyle("bottom", `${m}px`);
  };
  await P();
  const M = async (e) => {
    for (const r of e) await r.element.removeEventListener(r.type, r.id).catch(() => {
    });
    e.length = 0;
  }, v = async (e, r) => {
    const o = await n.addEventListener(e, r);
    $.push({
      element: n,
      type: e,
      id: o
    });
  }, rt = async (e) => {
    await M(_);
    for (const r of e) {
      const o = await r.addEventListener("scroll", nt);
      _.push({
        element: r,
        type: "scroll",
        id: o
      });
    }
  }, it = async (e, r) => {
    if (e !== null && r.first !== null) {
      const o = await e.getBoundingClientRect();
      let l = (await r.first.getBoundingClientRect()).top <= o.bottom + st;
      !l && r.chatBody !== null && (l = await r.chatBody.clientHeight() <= await e.clientHeight()), l !== E && (l ? await n.addClass(L) : await n.removeClass(L), E = l), await n.removeClass(B);
    } else
      E = !1, await n.addClass(B);
  }, p = async (e) => {
    if (O) {
      x = !0;
      return;
    }
    O = !0;
    try {
      const r = await a.querySelector(Tt), o = await V(a);
      e && await rt(r === null ? [] : [r]), await it(r, o);
    } catch (r) {
      console.error(`[${s}] refresh failed: ${c(r)}`);
    } finally {
      O = !1, x && (x = !1, p(!0));
    }
  }, nt = () => {
    const e = Date.now();
    e - C < lt || (C = e, p(!1));
  }, ot = (e) => {
    h !== null && clearTimeout(h), h = setTimeout(() => {
      h = null, p(e);
    }, ct);
  }, H = async (e) => {
    const r = e;
    if (typeof r.clientX != "number" || typeof r.clientY != "number") return !1;
    const o = await n.getBoundingClientRect();
    return r.clientX >= o.left && r.clientX <= o.right && r.clientY >= o.top && r.clientY <= o.bottom;
  };
  T = async () => {
    const e = await V(a);
    e.first !== null && (await e.first.scrollIntoView({
      behavior: "instant",
      block: "start"
    }), await p(!0));
  };
  let w = !1, d = !1, Y = 0, U = 0, k = 0, X = 0;
  return await v("pointerdown", (e) => {
    (async () => {
      if (!await H(e)) return;
      const r = e;
      w = !0, d = !1, Y = r.clientX, U = r.clientY, k = f, X = m;
    })();
  }), await v("pointermove", (e) => {
    (async () => {
      if (!w) return;
      const r = e;
      if (typeof r.clientX != "number" || typeof r.clientY != "number") return;
      const o = r.clientX - Y, l = r.clientY - U;
      Math.abs(o) + Math.abs(l) > ut && (d = !0);
      const G = await N(k + o, X - l);
      f = G.x, m = G.y, await P();
    })();
  }), await v("pointerup", (e) => {
    (async () => w && (w = !1, d && await Bt(await D(), {
      x: f,
      y: m
    })))();
  }), await v("pointercancel", (e) => {
    (async () => w && (w = !1, d = !1))();
  }), await v("click", (e) => {
    (async () => {
      if (d) {
        d = !1;
        return;
      }
      await H(e) && await T?.();
    })();
  }), await risuai.onUnload(async () => {
    await M($), await M(_), await n.remove().catch(() => {
    }), await S.remove().catch(() => {
    }), g = !1, T = null;
  }), await p(!0), g = !0, await j(), !0;
}, tt = async (t) => g ? (await T?.(), !0) : (y !== null || (y = At(t).catch(async (a) => (console.error(`[${s}] activation failed: ${c(a)}`), t === "auto" && await R(), !1)).finally(() => {
  y = null;
})), y), z = async () => {
  if (!b)
    try {
      await risuai.registerButton({
        name: "ToDown",
        icon: Q,
        iconType: "html",
        location: "action",
        id: J
      }, () => {
        (async () => await tt("manual") && await et())();
      }), b = !0;
    } catch (t) {
      console.error(`[${s}] failed to register activation button: ${c(t)}`);
    }
}, et = async () => {
  if (b)
    try {
      await risuai.unregisterUIPart(J), b = !1;
    } catch (t) {
      console.error(`[${s}] failed to unregister activation button: ${c(t)}`);
    }
}, $t = async () => {
  if (!await Rt()) {
    await z();
    return;
  }
  (async () => {
    if (await Z(yt), await tt("auto")) {
      await et();
      return;
    }
    await z();
  })();
};
try {
  await $t();
} catch (t) {
  const a = t instanceof Error ? t.message : "Unknown error";
  console.error(`[${s}] initialization failed: ${a}`);
}
