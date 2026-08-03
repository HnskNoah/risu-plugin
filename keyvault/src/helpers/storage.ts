export type ProviderConfig = {
  readonly id: string
  name: string
  baseUrl: string
  apiKey: string
  defaultModel: string
  stream: boolean
  stripModelPrefix: boolean
}

export type ProviderRecord = {
  readonly providers: ProviderConfig[]
}

const STORAGE_KEY = "providers"

type UnknownRecord = { readonly [key: string]: unknown }

type KVStorage = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null

const ID_PATTERN = /^[A-Za-z0-9_-]+$/

const sanitizeConfig = (value: unknown): ProviderConfig | null => {
  if (!isRecord(value)) {
    return null
  }
  const rawId = typeof value["id"] === "string" ? value["id"] : ""
  const id = ID_PATTERN.test(rawId) ? rawId : newProviderId()
  return {
    id,
    name: typeof value["name"] === "string" ? value["name"] : id,
    baseUrl: typeof value["baseUrl"] === "string" ? value["baseUrl"] : "",
    apiKey: typeof value["apiKey"] === "string" ? value["apiKey"] : "",
    defaultModel: typeof value["defaultModel"] === "string" ? value["defaultModel"] : "",
    stream: value["stream"] !== false,
    stripModelPrefix: value["stripModelPrefix"] === true,
  }
}

export const parseRecord = (text: string): ProviderRecord | null => {
  try {
    const parsed: unknown = JSON.parse(text)
    if (!isRecord(parsed) || !Array.isArray(parsed["providers"])) {
      return null
    }
    return {
      providers: parsed["providers"]
        .map(sanitizeConfig)
        .filter((config): config is ProviderConfig => config !== null),
    }
  } catch {
    return null
  }
}

export const serializeRecord = (record: ProviderRecord): string => JSON.stringify(record, null, 2)

export const parseProviders = (text: string): ProviderConfig[] | null =>
  parseRecord(text)?.providers ?? null

const getStorage = async (): Promise<KVStorage> => {
  if (typeof risuai.getLocalPluginStorage === "function") {
    try {
      const storage = await risuai.getLocalPluginStorage()
      return {
        async getItem(key: string): Promise<string | null> {
          const value = await storage.getItem<unknown>(key)
          if (value === null || value === undefined) {
            return null
          }
          return typeof value === "string" ? value : JSON.stringify(value)
        },
        async setItem(key: string, value: string): Promise<void> {
          await storage.setItem(key, JSON.parse(value))
        },
      }
    } catch (error) {
      console.error("[KeyVault] getLocalPluginStorage unavailable, falling back", error)
    }
  }
  if (typeof risuai.safeLocalStorage?.getItem === "function") {
    return {
      getItem: (key: string) => risuai.safeLocalStorage.getItem(key),
      setItem: (key: string, value: string) => risuai.safeLocalStorage.setItem(key, value),
    }
  }
  throw new Error("no plugin storage API available")
}

export const loadRecord = async (): Promise<ProviderRecord> => {
  try {
    const storage = await getStorage()
    const raw = await storage.getItem(STORAGE_KEY)
    if (raw === null) {
      return { providers: [] }
    }
    return parseRecord(raw) ?? { providers: [] }
  } catch (error) {
    console.error("[KeyVault] failed to load providers", error)
    return { providers: [] }
  }
}

export const loadProviders = async (): Promise<ProviderConfig[]> =>
  (await loadRecord()).providers

export const saveRecord = async (record: ProviderRecord): Promise<void> => {
  const storage = await getStorage()
  await storage.setItem(STORAGE_KEY, serializeRecord(record))
}

export const newProviderId = (): string =>
  `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
