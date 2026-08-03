import { PLUGIN_DISPLAY_NAME } from "../constants/plugin"
import { isAnthropicEndpoint } from "./presets"
import { loadProviders, type ProviderConfig } from "./storage"
import { inferTokenizer } from "./tokenizer"

const CHAT_COMPLETIONS_PATH = "/chat/completions"
const MODELS_PATH = "/models"

const ANTHROPIC_DIRECT_HEADER = "anthropic-dangerous-direct-browser-access"

export const normalizeBaseUrl = (baseUrl: string): string => {
  const url = baseUrl.trim().replace(/\/+$/, "")
  return url.includes("://") ? url : `https://${url}`
}

export const stripFirstPrefix = (modelName: string): string => {
  const segments = modelName.split("-")
  if (segments.length <= 1) {
    return modelName
  }
  const stripped = segments.slice(1).join("-")
  return stripped.length > 0 ? stripped : modelName
}

const buildHeaders = (apiKey: string, baseUrl: string, extra: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    ...extra,
  }
  if (isAnthropicEndpoint(baseUrl)) {
    headers[ANTHROPIC_DIRECT_HEADER] = "true"
  }
  return headers
}

const parseSSEStream = (body: ReadableStream<Uint8Array>): ReadableStream<string> => {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  return new ReadableStream<string>({
    async start(controller) {
      let frameCounter = 0

      const enqueueDataFrame = (data: string): boolean => {
        if (data === "[DONE]") {
          return true
        }
        try {
          const parsed: unknown = JSON.parse(data)
          if (typeof parsed === "object" && parsed !== null && "error" in parsed && parsed["error"] !== null) {
            console.error(
              `[${PLUGIN_DISPLAY_NAME}] stream error frame: ${JSON.stringify(parsed["error"]).slice(0, 300)}`,
            )
            return true
          }
          const delta = (parsed as { choices?: Array<{ delta?: { content?: unknown } }> })
            ?.choices?.[0]?.delta?.content
          if (typeof delta === "string" && delta.length > 0) {
            frameCounter += 1
            controller.enqueue(delta)
          }
        } catch {
          // ignore malformed SSE frames
        }
        return false
      }

      const consumeBuffer = (): boolean => {
        let newlineIndex: number
        while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)
          if (!line.startsWith("data:")) {
            continue
          }
          if (enqueueDataFrame(line.slice(5).trim())) {
            return true
          }
        }
        return false
      }

      const isAbortError = (error: unknown): boolean =>
        error instanceof Error && error.name === "AbortError"

      try {
        console.info(`[${PLUGIN_DISPLAY_NAME}] stream: started`)
        let stopped = false
        while (!stopped) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          buffer += decoder.decode(value, { stream: true })
          stopped = consumeBuffer()
        }
        if (!stopped) {
          const rest = buffer.trim()
          buffer = ""
          if (rest.startsWith("data:")) {
            stopped = enqueueDataFrame(rest.slice(5).trim())
          }
        }
        console.info(
          `[${PLUGIN_DISPLAY_NAME}] stream: finished — ${frameCounter} content frame(s), DONE=${stopped}`,
        )
        controller.close()
      } catch (error) {
        if (isAbortError(error)) {
          controller.close()
          return
        }
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[${PLUGIN_DISPLAY_NAME}] stream error: ${message}`)
        controller.error(error)
      }
    },
    cancel() {
      void reader.cancel()
    },
  })
}

const readErrorText = async (response: Response): Promise<string> => {
  try {
    const text = await response.text()
    return text.length > 0 ? `HTTP ${response.status}: ${text.slice(0, 300)}` : `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}`
  }
}

export type ProviderResult = {
  readonly success: boolean
  readonly content: string | ReadableStream<string>
}

export const friendlyHint = (detail: string, status: number | null): string | null => {
  if (status === 401 || status === 403) {
    return "认证失败,请检查 API Key 是否正确"
  }
  if (status === 404) {
    return "API 地址不存在,请检查是否缺少 /v1 或地址有误"
  }
  if (status === 429) {
    return "请求受限(429),请稍后重试"
  }
  if (status === 400) {
    return "请求被拒绝(400),请检查默认模型名是否正确"
  }
  if (status !== null && status >= 500) {
    return `服务商异常(HTTP ${status}),请稍后重试`
  }
  const lower = detail.toLowerCase()
  if (
    detail.includes("Failed to fetch") ||
    lower.includes("network") ||
    lower.includes("cors") ||
    lower.includes("load failed") ||
    lower.includes("timeout")
  ) {
    return "网络或 CORS 错误:请确认网络连通、服务商允许浏览器跨域,且 API 地址可访问"
  }
  return null
}

const fail = (name: string, detail: string): ProviderResult => {
  console.error(`[${PLUGIN_DISPLAY_NAME}] request failed (${name}): ${detail}`)
  const statusMatch = /^HTTP (\d{3})/.exec(detail)
  const status = statusMatch !== null ? Number(statusMatch[1]) : null
  const hint = friendlyHint(detail, status)
  return { success: false, content: hint !== null ? `KeyVault: ${hint}` : `KeyVault: ${detail}` }
}

const callProvider = async (
  configId: string,
  arg: {
    prompt_chat: unknown[]
    temperature: number
    top_p: number
    max_tokens: number
    frequency_penalty: number
    presence_penalty: number
  },
  abortSignal?: AbortSignal,
): Promise<ProviderResult> => {
  const providers = await loadProviders()
  const config = providers.find((provider) => provider.id === configId)
  if (config === undefined) {
    return fail(configId, "找不到服务商配置,请重载插件")
  }
  if (config.apiKey.length === 0) {
    return fail(config.name, "未配置 API Key")
  }
  if (config.baseUrl.trim().length === 0) {
    return fail(config.name, "未配置 API 地址")
  }
  if (config.defaultModel.length === 0) {
    return fail(config.name, "未选择默认模型")
  }

  const requestModel = config.stripModelPrefix ? stripFirstPrefix(config.defaultModel) : config.defaultModel

  const requestBody = JSON.stringify({
    model: requestModel,
    messages: arg.prompt_chat,
    temperature: arg.temperature,
    top_p: arg.top_p,
    max_tokens: arg.max_tokens,
    frequency_penalty: arg.frequency_penalty,
    presence_penalty: arg.presence_penalty,
    stream: config.stream,
  })

  const endpoint = normalizeBaseUrl(config.baseUrl) + CHAT_COMPLETIONS_PATH
  try {
    const response = await risuai.nativeFetch(endpoint, {
      method: "POST",
      headers: buildHeaders(config.apiKey, config.baseUrl, { "Content-Type": "application/json" }),
      body: requestBody,
      signal: abortSignal ?? null,
      logFetch: false,
    })

    if (!response.ok) {
      return fail(config.name, `${endpoint} → ${await readErrorText(response)}`)
    }

    if (config.stream) {
      if (response.body === null) {
        return fail(config.name, `${endpoint} → 服务商未返回流式响应`)
      }
      return { success: true, content: parseSSEStream(response.body) }
    }

    const json: unknown = await response.json()
    const content = (json as { choices?: Array<{ message?: { content?: unknown } }> })
      ?.choices?.[0]?.message?.content
    if (typeof content === "string") {
      return { success: true, content }
    }
    return fail(config.name, `响应格式异常 ${JSON.stringify(json).slice(0, 300)}`)
  } catch (error) {
    if (abortSignal?.aborted) {
      return { success: false, content: "KeyVault: 请求已取消" }
    }
    const message = error instanceof Error ? error.message : String(error)
    return fail(config.name, `${endpoint} → ${message}`)
  }
}

const usedProviderNames = new Set<string>()

const uniqueProviderName = (name: string): string => {
  if (!usedProviderNames.has(name)) {
    usedProviderNames.add(name)
    return name
  }
  let suffix = 2
  while (usedProviderNames.has(`${name} (${suffix})`)) {
    suffix += 1
  }
  const unique = `${name} (${suffix})`
  usedProviderNames.add(unique)
  return unique
}

export const registerAllProviders = async (): Promise<void> => {
  const providers = await loadProviders()
  for (const config of providers) {
    await registerOneProvider(config)
  }
  const names = providers.map((config) => config.name).join(", ") || "(无配置)"
  console.info(`[${PLUGIN_DISPLAY_NAME}] registered ${providers.length} provider(s): ${names}`)
}

const registerOneProvider = async (config: ProviderConfig): Promise<void> => {
  const fallbackName = `km_${config.id}`
  const providerName = uniqueProviderName(config.name.trim().length > 0 ? config.name : fallbackName)
  await risuai.addProvider(
    providerName,
    (arg, abortSignal) =>
      callProvider(
        config.id,
        {
          prompt_chat: arg.prompt_chat,
          temperature: arg.temperature,
          top_p: arg.top_p,
          max_tokens: arg.max_tokens,
          frequency_penalty: arg.frequency_penalty,
          presence_penalty: arg.presence_penalty,
        },
        abortSignal,
      ),
    {
      model: {
        name: config.name,
        shortName: config.name,
        fullName: config.name,
        tokenizer: inferTokenizer(config.stripModelPrefix ? stripFirstPrefix(config.defaultModel) : config.defaultModel),
      },
    },
  )
}

export type ListedModel = {
  readonly id: string
}

export const fetchModels = async (baseUrl: string, apiKey: string): Promise<ListedModel[]> => {
  const endpoint = normalizeBaseUrl(baseUrl) + MODELS_PATH
  try {
    const response = await risuai.nativeFetch(endpoint, {
      method: "GET",
      headers: buildHeaders(apiKey, baseUrl),
      logFetch: false,
    })
    if (!response.ok) {
      const detail = await readErrorText(response)
      console.error(`[${PLUGIN_DISPLAY_NAME}] fetch models failed: ${endpoint} → ${detail}`)
      throw new Error(detail)
    }
    const json: unknown = await response.json()
    const data = (json as { data?: unknown })?.data
    if (!Array.isArray(data)) {
      throw new Error("响应缺少 data 数组(非 OpenAI 兼容 /models 接口?)")
    }
    return data
      .map((item) => {
        const id = (item as { id?: unknown } | null)?.id
        return typeof id === "string" && id.length > 0 ? { id } : null
      })
      .filter((item): item is ListedModel => item !== null)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[${PLUGIN_DISPLAY_NAME}] fetch models failed: ${endpoint} → ${message}`)
    throw error
  }
}
