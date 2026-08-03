//@name keyvault
//@display-name keyvault
//@api 3.0
//@version 1.0.0
//@description API key manager for RISU AI
//@link https://unpkg.com/keyvault@1.0.0/dist/keyvault.js
const style = document.createElement("style");style.textContent = ":root{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark;color:canvastext;background:canvas;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}@media (prefers-color-scheme:dark){:root{--lightningcss-light: ;--lightningcss-dark:initial}}body{margin:0}.kv-root{box-sizing:border-box;max-width:760px;min-height:100dvh;margin:0 auto;padding:24px}@media (width<=768px){.kv-root{padding:16px 14px calc(18px + env(safe-area-inset-bottom))}.kv-title{font-size:1.2rem}.kv-input{font-size:16px}.kv-btn{min-height:44px}.kv-remove{width:40px;height:40px;font-size:1.3rem}.kv-card{padding:14px}.kv-card-head .kv-input{font-size:1rem}.kv-eye,.kv-refresh{min-height:40px;font-size:.85rem}.kv-save,.kv-add{min-height:48px;font-size:1rem}}.kv-header{justify-content:space-between;align-items:center;gap:12px;display:flex}.kv-title{margin:0;font-size:1.4rem}.kv-sub{color:color-mix(in srgb, CanvasText 70%, transparent);margin:8px 0 20px;line-height:1.5}.kv-presets{flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:16px;display:flex}.kv-presets-label{color:color-mix(in srgb, CanvasText 60%, transparent);font-size:.85rem}.kv-preset{padding:6px 12px;font-size:.85rem}.kv-list{flex-direction:column;gap:10px;display:flex}.kv-section{margin-bottom:18px}.kv-section-head{margin-bottom:8px}.kv-section-title{color:color-mix(in srgb, CanvasText 75%, transparent);margin:0;font-size:1rem}.kv-empty{border:1px dashed color-mix(in srgb, CanvasText 25%, transparent);text-align:center;color:color-mix(in srgb, CanvasText 45%, transparent);border-radius:14px;padding:22px;font-size:.9rem}.kv-badge{color:#60a5faf2;white-space:nowrap;background:#2563eb26;border-radius:6px;padding:2px 8px;font-size:.75rem;font-weight:600}.kv-card-title{overflow-wrap:anywhere;font-weight:600}.kv-draft-tip{color:color-mix(in srgb, CanvasText 55%, transparent);margin:0;font-size:.8rem}.kv-item{border:1px solid color-mix(in srgb, CanvasText 16%, transparent);background:color-mix(in srgb, Canvas 96%, CanvasText 4%);border-radius:12px;overflow:hidden}.kv-item-open{border-color:color-mix(in srgb, CanvasText 32%, transparent)}.kv-item-head{cursor:pointer;-webkit-user-select:none;user-select:none;align-items:center;gap:10px;padding:12px 14px;display:flex}.kv-item-head:hover{background:color-mix(in srgb, CanvasText 6%, transparent)}.kv-item-name{overflow-wrap:anywhere;min-width:0;font-weight:600}.kv-item-meta{min-width:0;color:color-mix(in srgb, CanvasText 55%, transparent);text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:.85rem;overflow:hidden}.kv-item-hint{color:color-mix(in srgb, CanvasText 45%, transparent);flex-shrink:0;font-size:.78rem}.kv-item-body{border-top:1px solid color-mix(in srgb, CanvasText 10%, transparent);flex-direction:column;gap:12px;padding:4px 14px 14px;display:flex}.kv-item-actions{justify-content:flex-end;padding:0 14px 12px;display:flex}.kv-item-delete{color:#ef4444;background:0 0;border-color:#ef444473}.kv-item-delete:hover{background:#ef44441f}.kv-card{border:1px solid color-mix(in srgb, CanvasText 16%, transparent);background:color-mix(in srgb, Canvas 96%, CanvasText 4%);border-radius:14px;flex-direction:column;gap:12px;padding:16px;transition:border-color .3s,box-shadow .3s;display:flex}.kv-card.kv-highlight{border-color:#2563ebcc;box-shadow:0 0 0 3px #2563eb40}.kv-card-head{align-items:center;gap:10px;display:flex}.kv-card-head .kv-input{flex:1;font-weight:600}.kv-remove{color:color-mix(in srgb, CanvasText 55%, transparent);cursor:pointer;background:0 0;border:0;border-radius:8px;width:32px;height:32px;font-size:1.2rem}.kv-remove:hover{color:#ef4444;background:#ef44441f}.kv-label{color:color-mix(in srgb, CanvasText 75%, transparent);flex-direction:column;gap:6px;font-size:.85rem;display:flex}.kv-input{box-sizing:border-box;border:1px solid color-mix(in srgb, CanvasText 25%, transparent);color:canvastext;width:100%;font:inherit;background:canvas;border-radius:8px;padding:8px 10px;font-size:.95rem}.kv-input:focus-visible{outline-offset:1px;outline:2px solid highlight}.kv-key-row,.kv-model-row{gap:8px;display:flex}.kv-key-row .kv-input,.kv-model-row .kv-input{flex:1}.kv-btn{border:1px solid color-mix(in srgb, CanvasText 25%, transparent);background:color-mix(in srgb, CanvasText 8%, transparent);color:canvastext;font:inherit;cursor:pointer;white-space:nowrap;border-radius:8px;padding:8px 12px;font-size:.9rem}.kv-btn:hover{background:color-mix(in srgb, CanvasText 15%, transparent)}.kv-btn:disabled{opacity:.5;cursor:default}.kv-check{cursor:pointer;align-items:center;gap:8px;font-size:.9rem;display:flex}.kv-actions{gap:10px;margin-top:18px;display:flex}.kv-add{flex:1}.kv-save{color:#fff;background:#2563ebeb;border-color:#0000;flex:1;font-weight:600}.kv-save:hover{background:#2563eb}.kv-clear{color:#ef4444;background:0 0;border-color:#ef444473}.kv-clear:hover{background:#ef44441f}.kv-close{border-radius:9999px;width:36px;height:36px;padding:0;font-size:1.2rem}.kv-error{color:#ef4444;word-break:break-all;font-size:.82rem}.kv-tip{color:color-mix(in srgb, CanvasText 55%, transparent);margin:14px 0 0;font-size:.8rem;line-height:1.6}\n/*$vite$:1*/";document.head.append(style);
var v = "KeyVault", S = [
  {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1"
  },
  {
    label: "OpenAI (GPT)",
    baseUrl: "https://api.openai.com/v1"
  },
  {
    label: "Claude (Anthropic)",
    baseUrl: "https://api.anthropic.com/v1"
  },
  {
    label: "GLM (智谱)",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4"
  },
  {
    label: "Kimi (Moonshot)",
    baseUrl: "https://api.moonshot.cn/v1"
  },
  {
    label: "MiniMax",
    baseUrl: "https://api.minimax.chat/v1"
  },
  {
    label: "MiMo (小米)",
    baseUrl: "https://api.xiaomimimo.com/v1"
  }
], Y = (e) => Z(e).includes("anthropic.com"), Z = (e) => e.trim().toLowerCase(), C = "providers", B = (e) => typeof e == "object" && e !== null, Q = /^[A-Za-z0-9_-]+$/, X = (e) => {
  if (!B(e)) return null;
  const t = typeof e.id == "string" ? e.id : "", n = Q.test(t) ? t : M();
  return {
    id: n,
    name: typeof e.name == "string" ? e.name : n,
    baseUrl: typeof e.baseUrl == "string" ? e.baseUrl : "",
    apiKey: typeof e.apiKey == "string" ? e.apiKey : "",
    defaultModel: typeof e.defaultModel == "string" ? e.defaultModel : "",
    stream: e.stream !== !1,
    stripModelPrefix: e.stripModelPrefix === !0
  };
}, _ = (e) => {
  try {
    const t = JSON.parse(e);
    return !B(t) || !Array.isArray(t.providers) ? null : { providers: t.providers.map(X).filter((n) => n !== null) };
  } catch {
    return null;
  }
}, x = (e) => JSON.stringify(e, null, 2), N = async () => {
  if (typeof risuai.getLocalPluginStorage == "function") try {
    const e = await risuai.getLocalPluginStorage();
    return {
      async getItem(t) {
        const n = await e.getItem(t);
        return n == null ? null : typeof n == "string" ? n : JSON.stringify(n);
      },
      async setItem(t, n) {
        await e.setItem(t, JSON.parse(n));
      }
    };
  } catch (e) {
    console.error("[KeyVault] getLocalPluginStorage unavailable, falling back", e);
  }
  if (typeof risuai.safeLocalStorage?.getItem == "function") return {
    getItem: (e) => risuai.safeLocalStorage.getItem(e),
    setItem: (e, t) => risuai.safeLocalStorage.setItem(e, t)
  };
  throw new Error("no plugin storage API available");
}, O = async () => {
  try {
    const e = await (await N()).getItem(C);
    return e === null ? { providers: [] } : _(e) ?? { providers: [] };
  } catch (e) {
    return console.error("[KeyVault] failed to load providers", e), { providers: [] };
  }
}, H = async () => (await O()).providers, P = async (e) => {
  await (await N()).setItem(C, x(e));
}, M = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, m = {
  Unknown: 0,
  tiktokenCl100kBase: 1,
  tiktokenO200Base: 2,
  Mistral: 3,
  Llama: 4,
  NovelAI: 5,
  Claude: 6,
  NovelList: 7,
  Llama3: 8,
  Gemma: 9,
  GoogleCloud: 10,
  Cohere: 11,
  Local: 12,
  DeepSeek: 13,
  DeepSeekV4: 14,
  GLM4: 15,
  GLM5: 16
}, ee = (e) => {
  const t = e.toLowerCase();
  return t.includes("deepseek") ? m.DeepSeekV4 : t.includes("claude") ? m.Claude : t.includes("gemini") ? m.GoogleCloud : t.includes("gemma") ? m.Gemma : t.includes("mimo") ? m.tiktokenCl100kBase : t.includes("gpt-4o") || t.includes("gpt-5") || t.includes("o1") || t.includes("o3") ? m.tiktokenO200Base : t.includes("gpt-") ? m.tiktokenCl100kBase : t.includes("llama3") || t.includes("llama-3") ? m.Llama3 : t.includes("llama") ? m.Llama : t.includes("mistral") ? m.Mistral : t.includes("glm") ? m.GLM5 : t.includes("cohere") ? m.Cohere : m.tiktokenO200Base;
}, te = "/chat/completions", re = "/models", ne = "anthropic-dangerous-direct-browser-access", q = (e) => {
  const t = e.trim().replace(/\/+$/, "");
  return t.includes("://") ? t : `https://${t}`;
}, R = (e) => {
  const t = e.split("-");
  if (t.length <= 1) return e;
  const n = t.slice(1).join("-");
  return n.length > 0 ? n : e;
}, j = (e, t, n = {}) => {
  const r = {
    Authorization: `Bearer ${e}`,
    ...n
  };
  return Y(t) && (r[ne] = "true"), r;
}, ae = (e) => {
  const t = e.getReader(), n = new TextDecoder();
  let r = "";
  return new ReadableStream({
    async start(l) {
      let d = 0;
      const o = (i) => {
        if (i === "[DONE]") return !0;
        try {
          const c = JSON.parse(i);
          if (typeof c == "object" && c !== null && "error" in c && c.error !== null)
            return console.error(`[${v}] stream error frame: ${JSON.stringify(c.error).slice(0, 300)}`), !0;
          const g = c?.choices?.[0]?.delta?.content;
          typeof g == "string" && g.length > 0 && (d += 1, l.enqueue(g));
        } catch {
        }
        return !1;
      }, a = () => {
        let i;
        for (; (i = r.indexOf(`
`)) >= 0; ) {
          const c = r.slice(0, i).trim();
          if (r = r.slice(i + 1), !!c.startsWith("data:") && o(c.slice(5).trim()))
            return !0;
        }
        return !1;
      }, s = (i) => i instanceof Error && i.name === "AbortError";
      try {
        console.info(`[${v}] stream: started`);
        let i = !1;
        for (; !i; ) {
          const { done: c, value: g } = await t.read();
          if (c) break;
          r += n.decode(g, { stream: !0 }), i = a();
        }
        if (!i) {
          const c = r.trim();
          r = "", c.startsWith("data:") && (i = o(c.slice(5).trim()));
        }
        console.info(`[${v}] stream: finished — ${d} content frame(s), DONE=${i}`), l.close();
      } catch (i) {
        if (s(i)) {
          l.close();
          return;
        }
        const c = i instanceof Error ? i.message : String(i);
        console.error(`[${v}] stream error: ${c}`), l.error(i);
      }
    },
    cancel() {
      t.cancel();
    }
  });
}, V = async (e) => {
  try {
    const t = await e.text();
    return t.length > 0 ? `HTTP ${e.status}: ${t.slice(0, 300)}` : `HTTP ${e.status}`;
  } catch {
    return `HTTP ${e.status}`;
  }
}, D = (e, t) => {
  if (t === 401 || t === 403) return "认证失败,请检查 API Key 是否正确";
  if (t === 404) return "API 地址不存在,请检查是否缺少 /v1 或地址有误";
  if (t === 429) return "请求受限(429),请稍后重试";
  if (t === 400) return "请求被拒绝(400),请检查默认模型名是否正确";
  if (t !== null && t >= 500) return `服务商异常(HTTP ${t}),请稍后重试`;
  const n = e.toLowerCase();
  return e.includes("Failed to fetch") || n.includes("network") || n.includes("cors") || n.includes("load failed") || n.includes("timeout") ? "网络或 CORS 错误:请确认网络连通、服务商允许浏览器跨域,且 API 地址可访问" : null;
}, y = (e, t) => {
  console.error(`[${v}] request failed (${e}): ${t}`);
  const n = /^HTTP (\d{3})/.exec(t), r = n !== null ? Number(n[1]) : null, l = D(t, r);
  return {
    success: !1,
    content: l !== null ? `KeyVault: ${l}` : `KeyVault: ${t}`
  };
}, se = async (e, t, n) => {
  const r = (await H()).find((a) => a.id === e);
  if (r === void 0) return y(e, "找不到服务商配置,请重载插件");
  if (r.apiKey.length === 0) return y(r.name, "未配置 API Key");
  if (r.baseUrl.trim().length === 0) return y(r.name, "未配置 API 地址");
  if (r.defaultModel.length === 0) return y(r.name, "未选择默认模型");
  const l = r.stripModelPrefix ? R(r.defaultModel) : r.defaultModel, d = JSON.stringify({
    model: l,
    messages: t.prompt_chat,
    temperature: t.temperature,
    top_p: t.top_p,
    max_tokens: t.max_tokens,
    frequency_penalty: t.frequency_penalty,
    presence_penalty: t.presence_penalty,
    stream: r.stream
  }), o = q(r.baseUrl) + te;
  try {
    const a = await risuai.nativeFetch(o, {
      method: "POST",
      headers: j(r.apiKey, r.baseUrl, { "Content-Type": "application/json" }),
      body: d,
      signal: n ?? null,
      logFetch: !1
    });
    if (!a.ok) return y(r.name, `${o} → ${await V(a)}`);
    if (r.stream)
      return a.body === null ? y(r.name, `${o} → 服务商未返回流式响应`) : {
        success: !0,
        content: ae(a.body)
      };
    const s = await a.json(), i = s?.choices?.[0]?.message?.content;
    return typeof i == "string" ? {
      success: !0,
      content: i
    } : y(r.name, `响应格式异常 ${JSON.stringify(s).slice(0, 300)}`);
  } catch (a) {
    if (n?.aborted) return {
      success: !1,
      content: "KeyVault: 请求已取消"
    };
    const s = a instanceof Error ? a.message : String(a);
    return y(r.name, `${o} → ${s}`);
  }
}, $ = /* @__PURE__ */ new Set(), oe = (e) => {
  if (!$.has(e))
    return $.add(e), e;
  let t = 2;
  for (; $.has(`${e} (${t})`); ) t += 1;
  const n = `${e} (${t})`;
  return $.add(n), n;
}, ie = async () => {
  const e = await H();
  for (const n of e) await le(n);
  const t = e.map((n) => n.name).join(", ") || "(无配置)";
  console.info(`[${v}] registered ${e.length} provider(s): ${t}`);
}, le = async (e) => {
  const t = `km_${e.id}`, n = oe(e.name.trim().length > 0 ? e.name : t);
  await risuai.addProvider(n, (r, l) => se(e.id, {
    prompt_chat: r.prompt_chat,
    temperature: r.temperature,
    top_p: r.top_p,
    max_tokens: r.max_tokens,
    frequency_penalty: r.frequency_penalty,
    presence_penalty: r.presence_penalty
  }, l), { model: {
    name: e.name,
    shortName: e.name,
    fullName: e.name,
    tokenizer: ee(e.stripModelPrefix ? R(e.defaultModel) : e.defaultModel)
  } });
}, ce = async (e, t) => {
  const n = q(e) + re;
  try {
    const r = await risuai.nativeFetch(n, {
      method: "GET",
      headers: j(t, e),
      logFetch: !1
    });
    if (!r.ok) {
      const d = await V(r);
      throw console.error(`[${v}] fetch models failed: ${n} → ${d}`), new Error(d);
    }
    const l = (await r.json())?.data;
    if (!Array.isArray(l)) throw new Error("响应缺少 data 数组(非 OpenAI 兼容 /models 接口?)");
    return l.map((d) => {
      const o = d?.id;
      return typeof o == "string" && o.length > 0 ? { id: o } : null;
    }).filter((d) => d !== null);
  } catch (r) {
    const l = r instanceof Error ? r.message : String(r);
    throw console.error(`[${v}] fetch models failed: ${n} → ${l}`), r;
  }
}, f = (e) => e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"), de = (e) => e.models.map((t) => `<option value="${f(t)}">${f(t)}</option>`).join(""), G = (e, t) => `
  <label class="kv-label">名称
    <input class="kv-input" data-field="name" value="${f(e.config.name)}" placeholder="如 DeepSeek V4">
  </label>
  <label class="kv-label">API 地址
    <input class="kv-input" data-field="baseUrl" value="${f(e.config.baseUrl)}" placeholder="https://api.deepseek.com/v1(不含 /chat/completions)">
  </label>
  <label class="kv-label">API Key
    <span class="kv-key-row">
      <input class="kv-input" data-field="apiKey" type="${e.showKey ? "text" : "password"}" value="${f(e.config.apiKey)}" placeholder="sk-..." autocomplete="off">
      <button class="kv-btn kv-eye" type="button">${e.showKey ? "隐藏" : "显示"}</button>
    </span>
  </label>
  <label class="kv-label">默认模型
    <span class="kv-model-row">
      <input class="kv-input" list="kv-models-${f(e.config.id)}" data-field="defaultModel" value="${f(e.config.defaultModel)}" placeholder="${e.loadingModels ? "加载中..." : "选择或输入模型名"}">
      ${t ? `<datalist id="kv-models-${f(e.config.id)}">${de(e)}</datalist>` : ""}
      <button class="kv-btn kv-refresh" type="button" ${e.loadingModels ? "disabled" : ""}>${e.loadingModels ? "..." : "刷新"}</button>
    </span>
  </label>
  ${e.modelError !== "" ? `<div class="kv-error">${f(e.modelError)}</div>` : ""}
  <label class="kv-check"><input type="checkbox" data-field="stripModelPrefix" ${e.config.stripModelPrefix ? "checked" : ""}> 去掉模型名的第一个前缀段(如 gcli-gemini... 请求时发 gemini...)</label>
  <label class="kv-check"><input type="checkbox" data-field="stream" ${e.config.stream ? "checked" : ""}> 流式输出</label>
`, F = (e) => e === null ? '<div class="kv-empty">尚未选择服务商 — 点击上方预设开始添加新配置</div>' : `
    <div class="kv-card kv-draft" data-id="${f(e.config.id)}">
      <div class="kv-card-head">
        <span class="kv-badge">新建</span>
        <span class="kv-card-title">${f(e.config.name || "未命名配置")}</span>
      </div>
      ${G(e, !0)}
      <p class="kv-draft-tip">填写完整后点击底部「保存」,自动加入配置列表</p>
    </div>
  `, ue = (e, t) => {
  const n = e.config.defaultModel || "未选择模型", r = z(e.config.baseUrl);
  return `
    <div class="kv-item ${t ? "kv-item-open" : ""}" data-id="${f(e.config.id)}">
      <div class="kv-item-head" data-toggle="1">
        <span class="kv-item-name">${f(e.config.name || "未命名")}</span>
        <span class="kv-item-meta">${f(n)}${r !== null ? ` · ${f(r)}` : ""}</span>
        <span class="kv-item-hint">${t ? "收起" : "编辑"}</span>
      </div>
      ${t ? `<div class="kv-item-body">${G(e, !0)}</div>` : ""}
      <div class="kv-item-actions">
        <button class="kv-btn kv-item-delete" type="button">删除</button>
      </div>
    </div>
  `;
}, z = (e) => {
  try {
    return new URL(e.trim().includes("://") ? e.trim() : `https://${e.trim()}`).host;
  } catch {
    return null;
  }
}, L = (e, t) => {
  const n = e.config.name.trim();
  if (n !== "" && n !== "自定义") return;
  const r = z(t);
  if (r === null) return;
  e.config.name = r;
  const l = document.querySelector(`.kv-card[data-id="${e.config.id}"], .kv-item[data-id="${e.config.id}"]`);
  if (l === null) return;
  const d = l.querySelector('[data-field="name"]');
  d !== null && (d.value = r);
  const o = l.querySelector(".kv-card-title");
  o !== null && (o.textContent = r);
}, J = (e) => e.cards.map((t) => ue(t, e.expandedId === t.config.id)).join(""), E = (e) => {
  const t = document.querySelector(`.kv-card[data-id="${e.config.id}"], .kv-item[data-id="${e.config.id}"]`);
  if (t === null || t.querySelector('[data-field="name"]') === null) return;
  const n = (d) => t.querySelector(`[data-field="${d}"]`)?.value ?? "";
  e.config.name = n("name"), e.config.baseUrl = n("baseUrl"), e.config.apiKey = n("apiKey"), e.config.defaultModel = n("defaultModel");
  const r = t.querySelector('[data-field="stream"]');
  e.config.stream = r?.checked ?? !0;
  const l = t.querySelector('[data-field="stripModelPrefix"]');
  e.config.stripModelPrefix = l?.checked ?? !1;
}, fe = async (e, t) => {
  const n = document.querySelector(`.kv-card[data-id="${t.config.id}"], .kv-item[data-id="${t.config.id}"]`);
  if (n === null) return;
  const r = n.querySelector('[data-field="baseUrl"]'), l = n.querySelector('[data-field="apiKey"]'), d = r?.value ?? "", o = l?.value ?? "";
  if (d.trim().length === 0) {
    t.modelError = "请先填写 API 地址", p(e);
    return;
  }
  if (o.trim().length === 0) {
    t.modelError = "请先填写 API Key", p(e);
    return;
  }
  t.loadingModels = !0, t.modelError = "", p(e);
  try {
    const a = await ce(d, o);
    t.models = a.map((s) => s.id), a.length === 0 ? t.modelError = "服务商未返回任何模型,可直接在模型框手动输入模型名" : a.some((s) => s.id === t.config.defaultModel) || (t.modelError = "当前默认模型不在服务商列表中,已清空,请重新选择", t.config.defaultModel = "");
  } catch (a) {
    const s = a instanceof Error ? a.message : String(a), i = /^HTTP (\d{3})/.exec(s), c = i !== null ? Number(i[1]) : null;
    c === 404 ? t.modelError = "服务商不支持 /models 模型列表接口(HTTP 404),可直接输入模型名" : t.modelError = D(s, c) ?? s;
  } finally {
    t.loadingModels = !1, p(e);
  }
}, p = (e) => {
  const t = document.getElementById("kv-draft");
  t !== null && (t.innerHTML = F(e.draft));
  const n = document.getElementById("kv-list");
  n !== null && (n.innerHTML = J(e));
  const r = document.getElementById("kv-count");
  r !== null && (r.textContent = String(e.cards.length));
}, me = () => ({
  config: {
    id: M(),
    name: "",
    baseUrl: "",
    apiKey: "",
    defaultModel: "",
    stream: !0,
    stripModelPrefix: !1
  },
  models: [],
  loadingModels: !1,
  modelError: "",
  showKey: !1
}), A = (e, t) => {
  e.addEventListener("input", (n) => {
    const r = n.target, l = r.closest("[data-id]");
    if (l === null) return;
    const d = l.dataset.id ?? "", o = t.draft, a = o !== null && d === o.config.id ? o : t.cards.find((s) => s.config.id === d);
    a !== void 0 && (E(a), r instanceof HTMLInputElement && r.dataset.field === "baseUrl" && L(a, r.value));
  }), e.addEventListener("click", (n) => {
    const r = n.target, l = r.closest("[data-id]");
    if (l === null) return;
    const d = l.dataset.id ?? "", o = t.draft, a = o !== null && d === o.config.id ? o : t.cards.find((s) => s.config.id === d);
    if (a !== void 0) {
      if (r.classList.contains("kv-eye")) {
        a.showKey = !a.showKey, p(t);
        return;
      }
      if (r.classList.contains("kv-refresh")) {
        L(a, a.config.baseUrl), fe(t, a);
        return;
      }
    }
  });
}, pe = () => {
  const e = document.querySelector(".kv-draft");
  e !== null && (e.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  }), e.classList.add("kv-highlight"), setTimeout(() => e.classList.remove("kv-highlight"), 1200));
}, K = (e, t) => {
  try {
    const n = new Blob([t], { type: "application/json" }), r = URL.createObjectURL(n), l = document.createElement("a");
    return l.href = r, l.download = e, document.body.appendChild(l), l.click(), l.remove(), setTimeout(() => URL.revokeObjectURL(r), 5e3), !0;
  } catch (n) {
    return console.error("[KeyVault] export failed", n), !1;
  }
}, T = null, ve = async (e, t) => {
  const n = await O(), r = T ?? {
    cards: n.providers.map((o) => ({
      config: o,
      models: [],
      loadingModels: !1,
      modelError: "",
      showKey: !1
    })),
    draft: null,
    expandedId: null
  };
  T = r, e.innerHTML = `
    <div class="kv-root">
      <header class="kv-header">
        <h1 class="kv-title">KeyVault 配置</h1>
        <button class="kv-btn kv-close" id="kv-close" type="button">×</button>
      </header>
      <p class="kv-sub">统一管理 OpenAI 兼容服务商的 API Key。每个配置在模型列表生成一个条目,角色里选择即可。</p>
      <div class="kv-presets" id="kv-presets">
        <span class="kv-presets-label">添加服务商:</span>
        ${S.map((o, a) => `<button class="kv-btn kv-preset" type="button" data-preset="${a}">${f(o.label)}</button>`).join("")}
        <button class="kv-btn kv-preset" type="button" data-preset="-1">自定义</button>
      </div>
      <div class="kv-section" id="kv-draft">${F(r.draft)}</div>
      <div class="kv-section">
        <div class="kv-section-head">
          <h2 class="kv-section-title">已保存配置 (<span id="kv-count">0</span>)</h2>
        </div>
        <div class="kv-list" id="kv-list">${J(r)}</div>
      </div>
      <div class="kv-actions">
        <button class="kv-btn kv-save" id="kv-save" type="button">保存</button>
        <button class="kv-btn" id="kv-import" type="button">导入</button>
        <button class="kv-btn" id="kv-export-key" type="button">导出(含Key)</button>
        <button class="kv-btn" id="kv-export-no-key" type="button">导出(无Key)</button>
        <button class="kv-btn kv-clear" id="kv-clear" type="button">清空配置</button>
      </div>
      <input type="file" id="kv-file" accept=".json,application/json" hidden>
      <p class="kv-tip">提示:保存后需 <b>重新加载插件</b> 才生效。API Key 仅存储在本机浏览器。导出文件含 Key 时请注意保管。</p>
      <p id="kv-save-msg"></p>
    </div>
  `;
  const l = document.getElementById("kv-draft"), d = document.getElementById("kv-list");
  l !== null && A(l, r), d !== null && (A(d, r), d.addEventListener("click", (o) => {
    const a = o.target, s = a.closest(".kv-item-head");
    if (s !== null) {
      const c = s.closest(".kv-item")?.dataset.id ?? "";
      r.expandedId = r.expandedId === c ? null : c, p(r);
      return;
    }
    const i = a.closest(".kv-item-delete");
    if (i !== null) {
      const c = i.closest(".kv-item")?.dataset.id ?? "", g = r.cards.find((k) => k.config.id === c)?.config.name || "未命名配置";
      if (!window.confirm(`删除配置「${g}」?保存后生效,不可恢复。`)) return;
      r.cards = r.cards.filter((k) => k.config.id !== c), r.expandedId === c && (r.expandedId = null), p(r);
    }
  })), document.getElementById("kv-presets")?.addEventListener("click", (o) => {
    const a = o.target;
    if (!a.classList.contains("kv-preset")) return;
    const s = Number(a.dataset.preset), i = Number.isInteger(s) && s >= 0 ? S[s] ?? null : null, c = me();
    i !== null ? (c.config.name = i.label, c.config.baseUrl = i.baseUrl) : (c.config.name = "自定义", c.config.baseUrl = "api.deepseek.com"), r.draft = c, p(r), pe();
  }), document.getElementById("kv-save")?.addEventListener("click", async () => {
    if (r.draft !== null) {
      if (E(r.draft), r.draft.config.name.trim() === "") {
        u("草稿配置缺少名称,请先填写", !0);
        return;
      }
      if (r.draft.config.baseUrl.trim() === "") {
        u("草稿配置缺少 API 地址,请先填写", !0);
        return;
      }
      const s = r.draft;
      r.cards.push(s), r.draft = null, r.expandedId = s.config.id, u(`「${s.config.name}」已加入配置列表`, !1);
    }
    for (const s of r.cards) E(s);
    if (r.cards.length === 0) {
      u("没有可保存的配置:请先选择预设并填写完整", !0);
      return;
    }
    const o = r.cards.filter((s) => s.config.name.trim() === "" || s.config.baseUrl.trim() === ""), a = r.cards.map((s) => ({ ...s.config }));
    try {
      await P({ providers: a });
      const s = o.length > 0 ? `(注意:${o.length} 个配置缺少名称或地址,使用时可能报错)` : "";
      u(`已保存 ${a.length} 个配置 ✓ 重新加载插件后生效 ${s}`, !1);
    } catch (s) {
      const i = s instanceof Error ? s.message : String(s);
      console.error("[KeyVault] save failed", s), u(`保存失败:${i}`, !0);
    }
  }), document.getElementById("kv-import")?.addEventListener("click", () => {
    document.getElementById("kv-file")?.click();
  }), document.getElementById("kv-file")?.addEventListener("change", (o) => {
    const a = o.target, s = a.files?.[0];
    a.value = "", s !== void 0 && (async () => {
      try {
        const i = await s.text(), c = _(i);
        if (c === null) {
          u("导入失败:不是有效的 KeyVault 配置文件", !0);
          return;
        }
        const g = c.providers;
        if (g.length === 0) {
          u("导入失败:文件中没有任何配置", !0);
          return;
        }
        if (r.cards.length > 0 && !window.confirm(`导入将替换当前 ${r.cards.length} 个配置(原配置仍在插件中生效,保存后才会被覆盖)。继续?`))
          return;
        const k = /* @__PURE__ */ new Set(), W = g.map((h) => {
          if (k.has(h.id) || r.cards.some((b) => b.config.id === h.id)) {
            const b = {
              ...h,
              id: M()
            };
            return k.add(b.id), b;
          }
          return k.add(h.id), h;
        });
        r.cards = W.map((h) => ({
          config: h,
          models: [],
          loadingModels: !1,
          modelError: "",
          showKey: !1
        })), r.expandedId = null, p(r), u(`已导入 ${r.cards.length} 个配置,请点击保存生效`, !1);
      } catch (i) {
        const c = i instanceof Error ? i.message : String(i);
        console.error("[KeyVault] import failed", i), u(`导入失败:${c}`, !0);
      }
    })();
  }), document.getElementById("kv-export-key")?.addEventListener("click", () => {
    U(r);
    const o = x({ providers: r.cards.map((a) => ({ ...a.config })) });
    K("keyvault-config.json", o) ? u("已导出(含 API Key),请妥善保管", !1) : u("导出失败:浏览器阻止了下载", !0);
  }), document.getElementById("kv-export-no-key")?.addEventListener("click", () => {
    U(r);
    const o = r.cards.map((s) => ({
      ...s.config,
      apiKey: ""
    })), a = x({ providers: o });
    K("keyvault-config.json", a) ? u("已导出(不含 Key)", !1) : u("导出失败:浏览器阻止了下载", !0);
  }), document.getElementById("kv-clear")?.addEventListener("click", async () => {
    if (r.cards.length === 0 && r.draft === null) {
      u("当前没有可清空的配置", !0);
      return;
    }
    if (window.confirm(`将删除全部 ${r.cards.length} 个配置并立即写入存储。RisuAI 内存中的旧插件条目需重启 RisuAI 才能完全清除。继续?`)) {
      r.cards = [], r.draft = null, r.expandedId = null;
      try {
        await P({ providers: [] }), p(r), u("已清空所有配置。请重启 RisuAI 清除残留条目,以免旧条目继续生效", !1);
      } catch (o) {
        const a = o instanceof Error ? o.message : String(o);
        console.error("[KeyVault] clear failed", o), u(`清空失败:${a}`, !0);
      }
    }
  }), document.getElementById("kv-close")?.addEventListener("click", t), p(r);
}, U = (e) => {
  for (const t of e.cards) E(t);
}, w = null, u = (e, t) => {
  const n = document.getElementById("kv-save-msg");
  n !== null && (n.textContent = e, n.className = t ? "kv-error" : "kv-tip", w !== null && window.clearTimeout(w), w = window.setTimeout(() => {
    n.textContent = "", n.className = "", w = null;
  }, 6e3));
}, I = null;
try {
  await ie();
} catch (e) {
  I = e instanceof Error ? e.message : "Unknown error", console.error(`[${v}] provider registration failed: ${I}`);
}
var ge = async () => {
  await risuai.showContainer("fullscreen");
  const e = () => {
    risuai.hideContainer();
  };
  try {
    if (await ve(document.body, e), I !== null) {
      const t = document.createElement("div");
      t.style.cssText = "padding:10px 14px;margin-bottom:12px;border-radius:10px;border:1px solid rgba(234,179,8,.5);background:rgba(234,179,8,.12);color:CanvasText;font-size:.85rem;line-height:1.5", t.textContent = `KeyVault 配置加载失败:${I}。请检查浏览器存储权限后重载插件。`, document.body.prepend(t);
    }
  } catch (t) {
    const n = t instanceof Error ? t.message : "Unknown plugin error";
    console.error(`${v} failed to open panel`, t), document.body.innerHTML = `<div class="kv-root"><p style="color:#ef4444">打开面板失败:${n}</p></div>`;
  }
};
await risuai.registerSetting(`${v} 配置`, ge, '<span aria-hidden="true">🔑</span>', "html", "keyvault-settings");
