export type Preset = {
  readonly label: string
  readonly baseUrl: string
}

export const PRESETS: readonly Preset[] = [
  { label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1" },
  { label: "OpenAI (GPT)", baseUrl: "https://api.openai.com/v1" },
  { label: "Claude (Anthropic)", baseUrl: "https://api.anthropic.com/v1" },
  { label: "GLM (智谱)", baseUrl: "https://open.bigmodel.cn/api/paas/v4" },
  { label: "Kimi (Moonshot)", baseUrl: "https://api.moonshot.cn/v1" },
  { label: "MiniMax", baseUrl: "https://api.minimax.chat/v1" },
  { label: "MiMo (小米)", baseUrl: "https://api.xiaomimimo.com/v1" },
]

export const isAnthropicEndpoint = (baseUrl: string): boolean =>
  normalizeForCheck(baseUrl).includes("anthropic.com")

const normalizeForCheck = (baseUrl: string): string => baseUrl.trim().toLowerCase()
