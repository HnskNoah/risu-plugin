import { fetchModels, friendlyHint } from "../helpers/providers"
import { PRESETS } from "../helpers/presets"
import {
  loadRecord,
  newProviderId,
  parseRecord,
  saveRecord,
  serializeRecord,
  type ProviderConfig,
} from "../helpers/storage"

type CardState = {
  readonly config: ProviderConfig
  models: string[]
  loadingModels: boolean
  modelError: string
  showKey: boolean
}

type PanelState = {
  cards: CardState[]
  draft: CardState | null
  expandedId: string | null
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

const modelOptionsHtml = (card: CardState): string =>
  card.models
    .map((id) => `<option value="${escapeHtml(id)}">${escapeHtml(id)}</option>`)
    .join("")

const cardFieldsHtml = (card: CardState, withModelList: boolean): string => `
  <label class="kv-label">名称
    <input class="kv-input" data-field="name" value="${escapeHtml(card.config.name)}" placeholder="如 DeepSeek V4">
  </label>
  <label class="kv-label">API 地址
    <input class="kv-input" data-field="baseUrl" value="${escapeHtml(card.config.baseUrl)}" placeholder="https://api.deepseek.com/v1(不含 /chat/completions)">
  </label>
  <label class="kv-label">API Key
    <span class="kv-key-row">
      <input class="kv-input" data-field="apiKey" type="${card.showKey ? "text" : "password"}" value="${escapeHtml(card.config.apiKey)}" placeholder="sk-..." autocomplete="off">
      <button class="kv-btn kv-eye" type="button">${card.showKey ? "隐藏" : "显示"}</button>
    </span>
  </label>
  <label class="kv-label">默认模型
    <span class="kv-model-row">
      <input class="kv-input" list="kv-models-${escapeHtml(card.config.id)}" data-field="defaultModel" value="${escapeHtml(card.config.defaultModel)}" placeholder="${card.loadingModels ? "加载中..." : "选择或输入模型名"}">
      ${withModelList ? `<datalist id="kv-models-${escapeHtml(card.config.id)}">${modelOptionsHtml(card)}</datalist>` : ""}
      <button class="kv-btn kv-refresh" type="button" ${card.loadingModels ? "disabled" : ""}>${card.loadingModels ? "..." : "刷新"}</button>
    </span>
  </label>
  ${card.modelError !== "" ? `<div class="kv-error">${escapeHtml(card.modelError)}</div>` : ""}
  <label class="kv-check"><input type="checkbox" data-field="stripModelPrefix" ${card.config.stripModelPrefix ? "checked" : ""}> 去掉模型名的第一个前缀段(如 gcli-gemini... 请求时发 gemini...)</label>
  <label class="kv-check"><input type="checkbox" data-field="stream" ${card.config.stream ? "checked" : ""}> 流式输出</label>
`

const draftHtml = (draft: CardState | null): string => {
  if (draft === null) {
    return `<div class="kv-empty">尚未选择服务商 — 点击上方预设开始添加新配置</div>`
  }
  return `
    <div class="kv-card kv-draft" data-id="${escapeHtml(draft.config.id)}">
      <div class="kv-card-head">
        <span class="kv-badge">新建</span>
        <span class="kv-card-title">${escapeHtml(draft.config.name || "未命名配置")}</span>
      </div>
      ${cardFieldsHtml(draft, true)}
      <p class="kv-draft-tip">填写完整后点击底部「保存」,自动加入配置列表</p>
    </div>
  `
}

const itemHtml = (card: CardState, expanded: boolean): string => {
  const model = card.config.defaultModel || "未选择模型"
  const host = safeHost(card.config.baseUrl)
  return `
    <div class="kv-item ${expanded ? "kv-item-open" : ""}" data-id="${escapeHtml(card.config.id)}">
      <div class="kv-item-head" data-toggle="1">
        <span class="kv-item-name">${escapeHtml(card.config.name || "未命名")}</span>
        <span class="kv-item-meta">${escapeHtml(model)}${host !== null ? ` · ${escapeHtml(host)}` : ""}</span>
        <span class="kv-item-hint">${expanded ? "收起" : "编辑"}</span>
      </div>
      ${expanded ? `<div class="kv-item-body">${cardFieldsHtml(card, true)}</div>` : ""}
      <div class="kv-item-actions">
        <button class="kv-btn kv-item-delete" type="button">删除</button>
      </div>
    </div>
  `
}

const safeHost = (baseUrl: string): string | null => {
  try {
    const url = new URL(baseUrl.trim().includes("://") ? baseUrl.trim() : `https://${baseUrl.trim()}`)
    return url.host
  } catch {
    return null
  }
}

const inferNameFromBaseUrl = (card: CardState, baseUrl: string): void => {
  const currentName = card.config.name.trim()
  if (currentName !== "" && currentName !== "自定义") {
    return
  }
  const host = safeHost(baseUrl)
  if (host === null) {
    return
  }
  card.config.name = host
  const root = document.querySelector<HTMLElement>(
    `.kv-card[data-id="${card.config.id}"], .kv-item[data-id="${card.config.id}"]`,
  )
  if (root === null) {
    return
  }
  const nameInput = root.querySelector<HTMLInputElement>('[data-field="name"]')
  if (nameInput !== null) {
    nameInput.value = host
  }
  const title = root.querySelector<HTMLElement>(".kv-card-title")
  if (title !== null) {
    title.textContent = host
  }
}

const renderList = (state: PanelState): string =>
  state.cards.map((card) => itemHtml(card, state.expandedId === card.config.id)).join("")

const syncCardConfig = (card: CardState): void => {
  const root = document.querySelector<HTMLElement>(`.kv-card[data-id="${card.config.id}"], .kv-item[data-id="${card.config.id}"]`)
  if (root === null) {
    return
  }
  const nameInput = root.querySelector<HTMLInputElement>('[data-field="name"]')
  if (nameInput === null) {
    return
  }
  const read = (field: string): string => {
    const input = root.querySelector<HTMLInputElement>(`[data-field="${field}"]`)
    return input?.value ?? ""
  }
  card.config.name = read("name")
  card.config.baseUrl = read("baseUrl")
  card.config.apiKey = read("apiKey")
  card.config.defaultModel = read("defaultModel")
  const streamBox = root.querySelector<HTMLInputElement>('[data-field="stream"]')
  card.config.stream = streamBox?.checked ?? true
  const stripBox = root.querySelector<HTMLInputElement>('[data-field="stripModelPrefix"]')
  card.config.stripModelPrefix = stripBox?.checked ?? false
}

const refreshModelsForCard = async (state: PanelState, card: CardState): Promise<void> => {
  const root = document.querySelector<HTMLElement>(`.kv-card[data-id="${card.config.id}"], .kv-item[data-id="${card.config.id}"]`)
  if (root === null) {
    return
  }
  const baseUrlInput = root.querySelector<HTMLInputElement>('[data-field="baseUrl"]')
  const keyInput = root.querySelector<HTMLInputElement>('[data-field="apiKey"]')
  const baseUrl = baseUrlInput?.value ?? ""
  const apiKey = keyInput?.value ?? ""
  if (baseUrl.trim().length === 0) {
    card.modelError = "请先填写 API 地址"
    render(state)
    return
  }
  if (apiKey.trim().length === 0) {
    card.modelError = "请先填写 API Key"
    render(state)
    return
  }
  card.loadingModels = true
  card.modelError = ""
  render(state)
  try {
    const models = await fetchModels(baseUrl, apiKey)
    card.models = models.map((model) => model.id)
    if (models.length === 0) {
      card.modelError = "服务商未返回任何模型,可直接在模型框手动输入模型名"
    } else if (!models.some((model) => model.id === card.config.defaultModel)) {
      card.modelError = "当前默认模型不在服务商列表中,已清空,请重新选择"
      card.config.defaultModel = ""
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const statusMatch = /^HTTP (\d{3})/.exec(message)
    const status = statusMatch !== null ? Number(statusMatch[1]) : null
    if (status === 404) {
      card.modelError = "服务商不支持 /models 模型列表接口(HTTP 404),可直接输入模型名"
    } else {
      card.modelError = friendlyHint(message, status) ?? message
    }
  } finally {
    card.loadingModels = false
    render(state)
  }
}

const render = (state: PanelState): void => {
  const draft = document.getElementById("kv-draft")
  if (draft !== null) {
    draft.innerHTML = draftHtml(state.draft)
  }
  const list = document.getElementById("kv-list")
  if (list !== null) {
    list.innerHTML = renderList(state)
  }
  const count = document.getElementById("kv-count")
  if (count !== null) {
    count.textContent = String(state.cards.length)
  }
}

const createEmptyCard = (): CardState => ({
  config: {
    id: newProviderId(),
    name: "",
    baseUrl: "",
    apiKey: "",
    defaultModel: "",
    stream: true,
    stripModelPrefix: false,
  },
  models: [],
  loadingModels: false,
  modelError: "",
  showKey: false,
})

const bindCardInput = (container: HTMLElement, state: PanelState): void => {
  container.addEventListener("input", (event) => {
    const target = event.target as HTMLElement
    const cardRoot = target.closest<HTMLElement>("[data-id]")
    if (cardRoot === null) {
      return
    }
    const id = cardRoot.dataset["id"] ?? ""
    const draft = state.draft
    const card = draft !== null && id === draft.config.id ? draft : state.cards.find((item) => item.config.id === id)
    if (card === undefined) {
      return
    }
    syncCardConfig(card)
    if (target instanceof HTMLInputElement && target.dataset["field"] === "baseUrl") {
      inferNameFromBaseUrl(card, target.value)
    }
  })

  container.addEventListener("click", (event) => {
    const target = event.target as HTMLElement
    const cardRoot = target.closest<HTMLElement>("[data-id]")
    if (cardRoot === null) {
      return
    }
    const id = cardRoot.dataset["id"] ?? ""
    const draft = state.draft
    const card = draft !== null && id === draft.config.id ? draft : state.cards.find((item) => item.config.id === id)
    if (card === undefined) {
      return
    }
    if (target.classList.contains("kv-eye")) {
      card.showKey = !card.showKey
      render(state)
      return
    }
    if (target.classList.contains("kv-refresh")) {
      inferNameFromBaseUrl(card, card.config.baseUrl)
      void refreshModelsForCard(state, card)
      return
    }
  })
}

const focusDraft = (): void => {
  const element = document.querySelector<HTMLElement>(".kv-draft")
  if (element === null) {
    return
  }
  element.scrollIntoView({ behavior: "smooth", block: "nearest" })
  element.classList.add("kv-highlight")
  setTimeout(() => element.classList.remove("kv-highlight"), 1200)
}

const downloadJson = (filename: string, text: string): boolean => {
  try {
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    return true
  } catch (error) {
    console.error("[KeyVault] export failed", error)
    return false
  }
}

let cachedState: PanelState | null = null

export const renderPanel = async (container: HTMLElement, close: () => void): Promise<void> => {
  const record = await loadRecord()
  const state: PanelState =
    cachedState ??
    {
      cards: record.providers.map((config) => ({
        config,
        models: [],
        loadingModels: false,
        modelError: "",
        showKey: false,
      })),
      draft: null,
      expandedId: null,
    }
  cachedState = state

  container.innerHTML = `
    <div class="kv-root">
      <header class="kv-header">
        <h1 class="kv-title">KeyVault 配置</h1>
        <button class="kv-btn kv-close" id="kv-close" type="button">×</button>
      </header>
      <p class="kv-sub">统一管理 OpenAI 兼容服务商的 API Key。每个配置在模型列表生成一个条目,角色里选择即可。</p>
      <div class="kv-presets" id="kv-presets">
        <span class="kv-presets-label">添加服务商:</span>
        ${PRESETS.map((preset, index) => `<button class="kv-btn kv-preset" type="button" data-preset="${index}">${escapeHtml(preset.label)}</button>`).join("")}
        <button class="kv-btn kv-preset" type="button" data-preset="-1">自定义</button>
      </div>
      <div class="kv-section" id="kv-draft">${draftHtml(state.draft)}</div>
      <div class="kv-section">
        <div class="kv-section-head">
          <h2 class="kv-section-title">已保存配置 (<span id="kv-count">0</span>)</h2>
        </div>
        <div class="kv-list" id="kv-list">${renderList(state)}</div>
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
  `

  const draft = document.getElementById("kv-draft")
  const list = document.getElementById("kv-list")
  if (draft !== null) {
    bindCardInput(draft, state)
  }
  if (list !== null) {
    bindCardInput(list, state)

    list.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const head = target.closest<HTMLElement>(".kv-item-head")
      if (head !== null) {
        const id = head.closest<HTMLElement>(".kv-item")?.dataset["id"] ?? ""
        state.expandedId = state.expandedId === id ? null : id
        render(state)
        return
      }
      const removeButton = target.closest<HTMLElement>(".kv-item-delete")
      if (removeButton !== null) {
        const id = removeButton.closest<HTMLElement>(".kv-item")?.dataset["id"] ?? ""
        const card = state.cards.find((item) => item.config.id === id)
        const name = card?.config.name || "未命名配置"
        if (!window.confirm(`删除配置「${name}」?保存后生效,不可恢复。`)) {
          return
        }
        state.cards = state.cards.filter((item) => item.config.id !== id)
        if (state.expandedId === id) {
          state.expandedId = null
        }
        render(state)
      }
    })
  }

  document.getElementById("kv-presets")?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement
    if (!target.classList.contains("kv-preset")) {
      return
    }
    const index = Number(target.dataset["preset"])
    const preset = Number.isInteger(index) && index >= 0 ? (PRESETS[index] ?? null) : null
    const draft = createEmptyCard()
    if (preset !== null) {
      draft.config.name = preset.label
      draft.config.baseUrl = preset.baseUrl
    } else {
      draft.config.name = "自定义"
      draft.config.baseUrl = "api.deepseek.com"
    }
    state.draft = draft
    render(state)
    focusDraft()
  })

  document.getElementById("kv-save")?.addEventListener("click", async () => {
    if (state.draft !== null) {
      syncCardConfig(state.draft)
      if (state.draft.config.name.trim() === "") {
        showSaveMessage("草稿配置缺少名称,请先填写", true)
        return
      }
      if (state.draft.config.baseUrl.trim() === "") {
        showSaveMessage("草稿配置缺少 API 地址,请先填写", true)
        return
      }
      const added = state.draft
      state.cards.push(added)
      state.draft = null
      state.expandedId = added.config.id
      showSaveMessage(`「${added.config.name}」已加入配置列表`, false)
    }
    for (const card of state.cards) {
      syncCardConfig(card)
    }
    if (state.cards.length === 0) {
      showSaveMessage("没有可保存的配置:请先选择预设并填写完整", true)
      return
    }
    const incomplete = state.cards.filter(
      (card) => card.config.name.trim() === "" || card.config.baseUrl.trim() === "",
    )
    const providers = state.cards.map((card) => ({ ...card.config }))
    try {
      await saveRecord({ providers })
      const suffix =
        incomplete.length > 0
          ? `(注意:${incomplete.length} 个配置缺少名称或地址,使用时可能报错)`
          : ""
      showSaveMessage(`已保存 ${providers.length} 个配置 ✓ 重新加载插件后生效 ${suffix}`, false)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("[KeyVault] save failed", error)
      showSaveMessage(`保存失败:${message}`, true)
    }
  })

  document.getElementById("kv-import")?.addEventListener("click", () => {
    document.getElementById("kv-file")?.click()
  })

  document.getElementById("kv-file")?.addEventListener("change", (event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ""
    if (file === undefined) {
      return
    }
    void (async () => {
      try {
        const text = await file.text()
        const record = parseRecord(text)
        if (record === null) {
          showSaveMessage("导入失败:不是有效的 KeyVault 配置文件", true)
          return
        }
        const parsed = record.providers
        if (parsed.length === 0) {
          showSaveMessage("导入失败:文件中没有任何配置", true)
          return
        }
        if (state.cards.length > 0) {
          const confirmed = window.confirm(
            `导入将替换当前 ${state.cards.length} 个配置(原配置仍在插件中生效,保存后才会被覆盖)。继续?`,
          )
          if (!confirmed) {
            return
          }
        }
        const seen = new Set<string>()
        const imported = parsed.map((provider) => {
          if (seen.has(provider.id) || state.cards.some((item) => item.config.id === provider.id)) {
            const fresh = { ...provider, id: newProviderId() }
            seen.add(fresh.id)
            return fresh
          }
          seen.add(provider.id)
          return provider
        })
        state.cards = imported.map((config) => ({
          config,
          models: [],
          loadingModels: false,
          modelError: "",
          showKey: false,
        }))
        state.expandedId = null
        render(state)
        showSaveMessage(`已导入 ${state.cards.length} 个配置,请点击保存生效`, false)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error("[KeyVault] import failed", error)
        showSaveMessage(`导入失败:${message}`, true)
      }
    })()
  })

  document.getElementById("kv-export-key")?.addEventListener("click", () => {
    syncAll(state)
    const text = serializeRecord({
      providers: state.cards.map((card) => ({ ...card.config })),
    })
    if (!downloadJson("keyvault-config.json", text)) {
      showSaveMessage("导出失败:浏览器阻止了下载", true)
    } else {
      showSaveMessage("已导出(含 API Key),请妥善保管", false)
    }
  })

  document.getElementById("kv-export-no-key")?.addEventListener("click", () => {
    syncAll(state)
    const providers = state.cards.map((card) => ({ ...card.config, apiKey: "" }))
    const text = serializeRecord({ providers })
    if (!downloadJson("keyvault-config.json", text)) {
      showSaveMessage("导出失败:浏览器阻止了下载", true)
    } else {
      showSaveMessage("已导出(不含 Key)", false)
    }
  })

  document.getElementById("kv-clear")?.addEventListener("click", async () => {
    if (state.cards.length === 0 && state.draft === null) {
      showSaveMessage("当前没有可清空的配置", true)
      return
    }
    const confirmed = window.confirm(
      `将删除全部 ${state.cards.length} 个配置并立即写入存储。` +
        "RisuAI 内存中的旧插件条目需重启 RisuAI 才能完全清除。继续?",
    )
    if (!confirmed) {
      return
    }
    state.cards = []
    state.draft = null
    state.expandedId = null
    try {
      await saveRecord({ providers: [] })
      render(state)
      showSaveMessage("已清空所有配置。请重启 RisuAI 清除残留条目,以免旧条目继续生效", false)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("[KeyVault] clear failed", error)
      showSaveMessage(`清空失败:${message}`, true)
    }
  })

  document.getElementById("kv-close")?.addEventListener("click", close)

  render(state)
}

const syncAll = (state: PanelState): void => {
  for (const card of state.cards) {
    syncCardConfig(card)
  }
}

let saveMessageTimer: number | null = null

const showSaveMessage = (text: string, isError: boolean): void => {
  const tip = document.getElementById("kv-save-msg")
  if (tip === null) {
    return
  }
  tip.textContent = text
  tip.className = isError ? "kv-error" : "kv-tip"
  if (saveMessageTimer !== null) {
    window.clearTimeout(saveMessageTimer)
  }
  saveMessageTimer = window.setTimeout(() => {
    tip.textContent = ""
    tip.className = ""
    saveMessageTimer = null
  }, 6000)
}
