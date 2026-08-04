import { PLUGIN_DISPLAY_NAME } from "../constants/plugin"

const BUTTON_CLASS = "todown-jump-button"
const AT_BOTTOM_CLASS = "todown-at-bottom"
const PENDING_CLASS = "todown-pending"
const AT_BOTTOM_THRESHOLD_PX = 100
const SCROLL_THROTTLE_MS = 80
const MUTATION_DEBOUNCE_MS = 300
const DRAG_THRESHOLD = 5
const BUTTON_SIZE = 48
const DEFAULT_LEFT = 14
const INPUT_HEIGHT_MULTIPLIER = 1.2
const FALLBACK_INPUT_HEIGHT = 56
const POSITION_STORAGE_KEY = "todown-position"
const POSITION_STORAGE_KEY_MOBILE = "todown-position-mobile"
const MOBILE_BREAKPOINT = 768
const AUTO_START_DELAY_MS = 4000
const BODY_RETRY_MS = 100
const BODY_RETRY_LIMIT = 100
const ACTIVATION_BUTTON_ID = "todown-activate"
const MAIN_DOM_PERMISSION_VERSION = "2026-08-main-dom-v1"
const MAIN_DOM_PERMISSION_VERSION_KEY = "todown-main-dom-permission-version"

const CHAT_SCREEN_SELECTOR = ".default-chat-screen"
const CHAT_BODY_SELECTOR = ".default-chat-screen > div.flex.flex-col-reverse"
const MESSAGE_SELECTOR = ".default-chat-screen .risu-chat"
const INPUT_SELECTORS = [
  ".default-chat-screen textarea",
  ".default-chat-screen [contenteditable]",
  ".default-chat-screen input[type='text']",
] as const
const BUTTON_MARKER = "x-todown-jump"

const BUTTON_HTML =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>'

const BUTTON_CSS = `.${BUTTON_CLASS} {
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
.${BUTTON_CLASS}:hover {
  background: rgba(39, 39, 42, 0.92);
}
.${BUTTON_CLASS}:active {
  cursor: grabbing;
}
.${BUTTON_CLASS}.${AT_BOTTOM_CLASS} {
  opacity: 0.4;
}
.${BUTTON_CLASS}.${PENDING_CLASS} {
  opacity: 0.25;
}
@media (max-width: 768px) {
  .${BUTTON_CLASS} {
    width: 48px;
    height: 48px;
    left: 10px;
    bottom: calc(12px + env(safe-area-inset-bottom));
  }
}`

type StoredListener = {
  readonly element: SafeElement
  readonly type: string
  readonly id: string
}

type MessageSet = {
  readonly chatBody: SafeElement | null
  readonly first: SafeElement | null
}

type StoredPosition = {
  readonly x: number
  readonly y: number
}

type ActivationSource = "manual" | "auto"

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max))

const queryMessages = async (doc: SafeDocument): Promise<MessageSet> => {
  const chatBody = await doc.querySelector(CHAT_BODY_SELECTOR)
  const first = await doc.querySelector(MESSAGE_SELECTOR)
  return { chatBody, first }
}

const measureInputHeight = async (doc: SafeDocument): Promise<number> => {
  for (const selector of INPUT_SELECTORS) {
    const element = await doc.querySelector(selector)
    if (element === null) {
      continue
    }
    const rect = await element.getBoundingClientRect()
    if (rect.height > 0) {
      return rect.height
    }
  }
  return FALLBACK_INPUT_HEIGHT
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const getRootDocumentOnce = async (): Promise<SafeDocument | null> => {
  try {
    return await risuai.getRootDocument()
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to get root document: ${errorMessage(error)}`)
    return null
  }
}

const waitForBody = async (doc: SafeDocument): Promise<SafeElement | null> => {
  for (let attempt = 0; attempt < BODY_RETRY_LIMIT; attempt += 1) {
    const body = await doc.querySelector("body")
    if (body !== null) {
      return body
    }
    await sleep(BODY_RETRY_MS)
  }
  return null
}

const isMobileViewport = async (body: SafeElement): Promise<boolean> => {
  const width = await body.clientWidth()
  return width <= MOBILE_BREAKPOINT
}

const loadPosition = async (key: string): Promise<StoredPosition | null> => {
  try {
    const storage = await risuai.getLocalPluginStorage()
    const stored = await storage.getItem<StoredPosition>(key)
    if (
      stored === null ||
      typeof stored !== "object" ||
      typeof stored.x !== "number" ||
      typeof stored.y !== "number" ||
      !Number.isFinite(stored.x) ||
      !Number.isFinite(stored.y)
    ) {
      return null
    }
    return { x: stored.x, y: stored.y }
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to load position: ${errorMessage(error)}`)
    return null
  }
}

const savePosition = async (key: string, position: StoredPosition): Promise<void> => {
  try {
    const storage = await risuai.getLocalPluginStorage()
    await storage.setItem(key, position)
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to save position: ${errorMessage(error)}`)
  }
}

const hasRememberedMainDomAccess = async (): Promise<boolean> => {
  try {
    const storage = await risuai.getLocalPluginStorage()
    return (await storage.getItem<string>(MAIN_DOM_PERMISSION_VERSION_KEY)) === MAIN_DOM_PERMISSION_VERSION
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to load main DOM permission marker: ${errorMessage(error)}`)
    return false
  }
}

const rememberMainDomAccess = async (): Promise<void> => {
  try {
    const storage = await risuai.getLocalPluginStorage()
    await storage.setItem(MAIN_DOM_PERMISSION_VERSION_KEY, MAIN_DOM_PERMISSION_VERSION)
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to save main DOM permission marker: ${errorMessage(error)}`)
  }
}

const forgetMainDomAccess = async (): Promise<void> => {
  try {
    const storage = await risuai.getLocalPluginStorage()
    await storage.removeItem(MAIN_DOM_PERMISSION_VERSION_KEY)
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to clear main DOM permission marker: ${errorMessage(error)}`)
  }
}

let mountPromise: Promise<boolean> | null = null
let mounted = false
let jumpToLatest: (() => Promise<void>) | null = null
let activationButtonRegistered = false

const mountJumpButton = async (source: ActivationSource): Promise<boolean> => {
  const doc = await getRootDocumentOnce()
  if (doc === null) {
    console.error(
      `[${PLUGIN_DISPLAY_NAME}] main document access denied or unavailable; use the ToDown button after the page finishes loading`,
    )
    if (source === "auto") {
      await forgetMainDomAccess()
    }
    return false
  }
  const existing = await doc.querySelector(`[${BUTTON_MARKER}]`)
  if (existing !== null) {
    mounted = true
    await rememberMainDomAccess()
    return true
  }

  const body = await waitForBody(doc)
  if (body === null) {
    if (source === "auto") {
      await forgetMainDomAccess()
    }
    throw new Error("main document body not found after waiting")
  }

  const button = await doc.createElement("button")
  await button.addClass(BUTTON_CLASS)
  await button.setAttribute(BUTTON_MARKER, "1")
  await button.setInnerHTML(BUTTON_HTML)

  const styleElement = await doc.createElement("style")
  await styleElement.setTextContent(BUTTON_CSS)
  await body.appendChild(styleElement)

  await body.appendChild(button)

  const observer = await risuai.createMutationObserver(() => {
    scheduleRefresh(true)
  })
  await observer.observe(body, { childList: true, subtree: true })

  let listeners: StoredListener[] = []
  const buttonListeners: StoredListener[] = []
  let wasAtBottom = false
  let refreshInFlight = false
  let refreshQueued = false
  let lastScrollAt = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const clampToViewport = async (x: number, y: number): Promise<{ x: number; y: number }> => {
    const viewportWidth = await body.clientWidth()
    const viewportHeight = await body.clientHeight()
    return {
      x: clamp(x, 0, Math.max(0, viewportWidth - BUTTON_SIZE)),
      y: clamp(y, 0, Math.max(0, viewportHeight - BUTTON_SIZE)),
    }
  }

  const inputHeight = await measureInputHeight(doc)
  let posX = DEFAULT_LEFT
  let posY = Math.round(inputHeight * INPUT_HEIGHT_MULTIPLIER)
  const positionKey = async (): Promise<string> =>
    (await isMobileViewport(body)) ? POSITION_STORAGE_KEY_MOBILE : POSITION_STORAGE_KEY
  const storedPosition = await loadPosition(await positionKey())
  if (storedPosition !== null) {
    const clamped = await clampToViewport(storedPosition.x, storedPosition.y)
    posX = clamped.x
    posY = clamped.y
  }

  const applyPosition = async (): Promise<void> => {
    await button.setStyle("left", `${posX}px`)
    await button.setStyle("bottom", `${posY}px`)
  }
  await applyPosition()

  const unwireListeners = async (store: StoredListener[]): Promise<void> => {
    for (const listener of store) {
      await listener.element
        .removeEventListener(listener.type, listener.id)
        .catch(() => undefined)
    }
    store.length = 0
  }

  const addButtonListener = async (
    type: string,
    callback: (event: unknown) => void,
  ): Promise<void> => {
    const id = await button.addEventListener(type, callback)
    buttonListeners.push({ element: button, type, id })
  }

  const wireScroll = async (targets: SafeElement[]): Promise<void> => {
    await unwireListeners(listeners)
    for (const element of targets) {
      const id = await element.addEventListener("scroll", onScroll)
      listeners.push({ element, type: "scroll", id })
    }
  }

  const updateButtonState = async (
    screen: SafeElement | null,
    messages: MessageSet,
  ): Promise<void> => {
    if (screen !== null && messages.first !== null) {
      const screenRect = await screen.getBoundingClientRect()
      const firstRect = await messages.first.getBoundingClientRect()
      let atBottom = firstRect.top <= screenRect.bottom + AT_BOTTOM_THRESHOLD_PX
      if (!atBottom && messages.chatBody !== null) {
        const chatBodyHeight = await messages.chatBody.clientHeight()
        const screenHeight = await screen.clientHeight()
        atBottom = chatBodyHeight <= screenHeight
      }

      if (atBottom !== wasAtBottom) {
        if (atBottom) {
          await button.addClass(AT_BOTTOM_CLASS)
        } else {
          await button.removeClass(AT_BOTTOM_CLASS)
        }
        wasAtBottom = atBottom
      }
      await button.removeClass(PENDING_CLASS)
    } else {
      wasAtBottom = false
      await button.addClass(PENDING_CLASS)
    }
  }

  const doRefresh = async (rewire: boolean): Promise<void> => {
    if (refreshInFlight) {
      refreshQueued = true
      return
    }
    refreshInFlight = true
    try {
      const screen = await doc.querySelector(CHAT_SCREEN_SELECTOR)
      const messages = await queryMessages(doc)
      if (rewire) {
        await wireScroll(screen === null ? [] : [screen])
      }
      await updateButtonState(screen, messages)
    } catch (error) {
      console.error(`[${PLUGIN_DISPLAY_NAME}] refresh failed: ${errorMessage(error)}`)
    } finally {
      refreshInFlight = false
      if (refreshQueued) {
        refreshQueued = false
        void doRefresh(true)
      }
    }
  }

  const onScroll = (): void => {
    const now = Date.now()
    if (now - lastScrollAt < SCROLL_THROTTLE_MS) {
      return
    }
    lastScrollAt = now
    void doRefresh(false)
  }

  const scheduleRefresh = (rewire: boolean): void => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void doRefresh(rewire)
    }, MUTATION_DEBOUNCE_MS)
  }

  const isInsideButton = async (event: unknown): Promise<boolean> => {
    const point = event as { readonly clientX?: unknown; readonly clientY?: unknown }
    if (typeof point.clientX !== "number" || typeof point.clientY !== "number") {
      return false
    }
    const rect = await button.getBoundingClientRect()
    return (
      point.clientX >= rect.left &&
      point.clientX <= rect.right &&
      point.clientY >= rect.top &&
      point.clientY <= rect.bottom
    )
  }

  jumpToLatest = async (): Promise<void> => {
    const messages = await queryMessages(doc)
    if (messages.first === null) {
      return
    }
    await messages.first.scrollIntoView({ behavior: "instant", block: "start" })
    await doRefresh(true)
  }

  let dragging = false
  let suppressClick = false
  let dragStartX = 0
  let dragStartY = 0
  let moveStartX = 0
  let moveStartY = 0

  await addButtonListener("pointerdown", (event) => {
    void (async () => {
      if (!(await isInsideButton(event))) {
        return
      }
      const point = event as { readonly clientX?: unknown; readonly clientY?: unknown }
      dragging = true
      suppressClick = false
      dragStartX = point.clientX as number
      dragStartY = point.clientY as number
      moveStartX = posX
      moveStartY = posY
    })()
  })

  await addButtonListener("pointermove", (event) => {
    void (async () => {
      if (!dragging) {
        return
      }
      const point = event as { readonly clientX?: unknown; readonly clientY?: unknown }
      if (typeof point.clientX !== "number" || typeof point.clientY !== "number") {
        return
      }
      const dx = point.clientX - dragStartX
      const dy = point.clientY - dragStartY
      if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
        suppressClick = true
      }
      const next = await clampToViewport(moveStartX + dx, moveStartY - dy)
      posX = next.x
      posY = next.y
      await applyPosition()
    })()
  })

  await addButtonListener("pointerup", (event) => {
    void (async () => {
      if (!dragging) {
        return
      }
      dragging = false
      if (suppressClick) {
        await savePosition(await positionKey(), { x: posX, y: posY })
      }
    })()
  })

  await addButtonListener("pointercancel", (event) => {
    void (async () => {
      if (!dragging) {
        return
      }
      dragging = false
      suppressClick = false
    })()
  })

  await addButtonListener("click", (event) => {
    void (async () => {
      if (suppressClick) {
        suppressClick = false
        return
      }
      if (!(await isInsideButton(event))) {
        return
      }
      await jumpToLatest?.()
    })()
  })

  await risuai.onUnload(async () => {
    await unwireListeners(buttonListeners)
    await unwireListeners(listeners)
    await button.remove().catch(() => undefined)
    await styleElement.remove().catch(() => undefined)
    mounted = false
    jumpToLatest = null
  })

  await doRefresh(true)
  mounted = true
  await rememberMainDomAccess()
  return true
}

const activateJumpButton = async (source: ActivationSource): Promise<boolean> => {
  if (mounted) {
    await jumpToLatest?.()
    return true
  }
  if (mountPromise !== null) {
    return mountPromise
  }

  mountPromise = mountJumpButton(source)
    .catch(async (error) => {
      console.error(`[${PLUGIN_DISPLAY_NAME}] activation failed: ${errorMessage(error)}`)
      if (source === "auto") {
        await forgetMainDomAccess()
      }
      return false
    })
    .finally(() => {
      mountPromise = null
    })
  return mountPromise
}

const registerActivationButton = async (): Promise<void> => {
  if (activationButtonRegistered) {
    return
  }
  try {
    await risuai.registerButton(
      {
        name: "ToDown",
        icon: BUTTON_HTML,
        iconType: "html",
        location: "action",
        id: ACTIVATION_BUTTON_ID,
      },
      () => {
        void (async () => {
          const activated = await activateJumpButton("manual")
          if (activated) {
            await unregisterActivationButton()
          }
        })()
      },
    )
    activationButtonRegistered = true
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to register activation button: ${errorMessage(error)}`)
  }
}

const unregisterActivationButton = async (): Promise<void> => {
  if (!activationButtonRegistered) {
    return
  }
  try {
    await risuai.unregisterUIPart(ACTIVATION_BUTTON_ID)
    activationButtonRegistered = false
  } catch (error) {
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to unregister activation button: ${errorMessage(error)}`)
  }
}

export const initializeJumpButton = async (): Promise<void> => {
  if (!(await hasRememberedMainDomAccess())) {
    await registerActivationButton()
    return
  }

  void (async () => {
    await sleep(AUTO_START_DELAY_MS)
    const activated = await activateJumpButton("auto")
    if (activated) {
      await unregisterActivationButton()
      return
    }
    await registerActivationButton()
  })()
}

export const createJumpButton = async (): Promise<void> => {
  const activated = await activateJumpButton("manual")
  if (activated) {
    await unregisterActivationButton()
  }
}
