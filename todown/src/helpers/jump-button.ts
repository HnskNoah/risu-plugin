import { PLUGIN_DISPLAY_NAME } from "../constants/plugin"

const BUTTON_CLASS = "todown-jump-button"
const AT_BOTTOM_CLASS = "todown-at-bottom"
const PENDING_CLASS = "todown-pending"
const BOTTOM_EPSILON = 8
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

const CHAT_SCREEN_SELECTORS = [".default-chat-screen"] as const
const CHAT_BODY_SELECTOR = ".default-chat-screen > div.flex.flex-col-reverse"
const MESSAGE_SELECTORS = [".default-chat-screen .risu-chat"] as const
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

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max))

const queryFirst = async (
  doc: SafeDocument,
  selectors: readonly string[],
): Promise<SafeElement | null> => {
  for (const selector of selectors) {
    const element = await doc.querySelector(selector)
    if (element !== null) {
      return element
    }
  }
  return null
}

const queryMessages = async (doc: SafeDocument): Promise<MessageSet> => {
  const chatBody = await doc.querySelector(CHAT_BODY_SELECTOR)
  for (const selector of MESSAGE_SELECTORS) {
    const list = await doc.querySelectorAll(selector)
    const length = await list.length()
    if (length > 0) {
      return {
        chatBody,
        first: (await list.at(0)) ?? null,
      }
    }
  }
  return { chatBody, first: null }
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
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to load position: ${message}`)
    return null
  }
}

const savePosition = async (key: string, position: StoredPosition): Promise<void> => {
  try {
    const storage = await risuai.getLocalPluginStorage()
    await storage.setItem(key, position)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[${PLUGIN_DISPLAY_NAME}] failed to save position: ${message}`)
  }
}

export const createJumpButton = async (): Promise<void> => {
  const doc = await risuai.getRootDocument()
  if (doc === null) {
    console.error(
      `[${PLUGIN_DISPLAY_NAME}] main document access denied or unavailable; grant permission and reload`,
    )
    return
  }
  const existing = await doc.querySelector(`[${BUTTON_MARKER}]`)
  if (existing !== null) {
    return
  }

  const body = await doc.querySelector("body")
  if (body === null) {
    throw new Error("main document body not found")
  }

  const button = await doc.createElement("button")
  await button.addClass(BUTTON_CLASS)
  await button.setAttribute(BUTTON_MARKER, "1")
  await button.setInnerHTML(BUTTON_HTML)

  const styleElement = await doc.createElement("style")
  await styleElement.setTextContent(BUTTON_CSS)
  await body.appendChild(styleElement)

  const styleTag = await styleElement.nodeName()
  if (styleTag !== "STYLE") {
    await button.setStyle("position", "fixed")
    await button.setStyle("left", "14px")
    await button.setStyle("bottom", "67px")
    await button.setStyle("z-index", "2147483000")
    await button.setStyle("width", "44px")
    await button.setStyle("height", "44px")
    await button.setStyle("border-radius", "9999px")
    await button.setStyle("background", "rgba(24, 24, 27, 0.85)")
    await button.setStyle("color", "#e4e4e7")
    await button.setStyle("cursor", "grab")
  }

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
  const positionKey = (await isMobileViewport(body))
    ? POSITION_STORAGE_KEY_MOBILE
    : POSITION_STORAGE_KEY
  const storedPosition = await loadPosition(positionKey)
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

  const unwireScroll = async (): Promise<void> => {
    for (const listener of listeners) {
      await listener.element
        .removeEventListener(listener.type, listener.id)
        .catch(() => undefined)
    }
    listeners = []
  }

  const unwireButton = async (): Promise<void> => {
    for (const listener of buttonListeners) {
      await listener.element
        .removeEventListener(listener.type, listener.id)
        .catch(() => undefined)
    }
    buttonListeners.length = 0
  }

  const addButtonListener = async (
    type: string,
    callback: (event: unknown) => void,
  ): Promise<void> => {
    const id = await button.addEventListener(type, callback)
    buttonListeners.push({ element: button, type, id })
  }

  const wireScroll = async (targets: SafeElement[]): Promise<void> => {
    await unwireScroll()
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
      let atBottom = firstRect.bottom >= screenRect.bottom - BOTTOM_EPSILON
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
      const screen = await queryFirst(doc, CHAT_SCREEN_SELECTORS)
      const messages = await queryMessages(doc)
      if (rewire) {
        await wireScroll(screen === null ? [] : [screen])
      }
      await updateButtonState(screen, messages)
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[${PLUGIN_DISPLAY_NAME}] refresh failed: ${error.message}`)
      }
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

  let dragging = false
  let suppressClick = false
  let dragStartX = 0
  let dragStartY = 0
  let moveStartX = 0
  let moveStartY = 0
  let rafPending = false

  await button.addEventListener("pointerdown", (event) => {
    void (async () => {
      if (!(await isInsideButton(event))) {
        return
      }
      const point = event as { readonly clientX?: unknown; readonly clientY?: unknown }
      dragging = true
      suppressClick = false
      dragStartX = Number(point.clientX)
      dragStartY = Number(point.clientY)
      moveStartX = posX
      moveStartY = posY
    })()
  })

  await button.addEventListener("pointermove", (event) => {
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
      if (!rafPending) {
        rafPending = true
        requestAnimationFrame(() => {
          rafPending = false
          void applyPosition()
        })
      }
    })()
  })

  await button.addEventListener("pointerup", (event) => {
    void (async () => {
      if (!dragging) {
        return
      }
      dragging = false
      if (suppressClick) {
        const key = (await isMobileViewport(body))
          ? POSITION_STORAGE_KEY_MOBILE
          : POSITION_STORAGE_KEY
        await savePosition(key, { x: posX, y: posY })
      }
    })()
  })

  await button.addEventListener("pointercancel", (event) => {
    void (async () => {
      if (!dragging) {
        return
      }
      dragging = false
      suppressClick = false
    })()
  })

  await button.addEventListener("click", (event) => {
    void (async () => {
      if (suppressClick) {
        suppressClick = false
        return
      }
      const point = event as { readonly clientX?: unknown; readonly clientY?: unknown }
      if (typeof point.clientX !== "number" || typeof point.clientY !== "number") {
        return
      }
      const rect = await button.getBoundingClientRect()
      if (
        point.clientX < rect.left ||
        point.clientX > rect.right ||
        point.clientY < rect.top ||
        point.clientY > rect.bottom
      ) {
        return
      }
      console.info(`[${PLUGIN_DISPLAY_NAME}] jump button clicked at (${point.clientX}, ${point.clientY})`)
      const messages = await queryMessages(doc)
      if (messages.first === null) {
        return
      }
      await messages.first.scrollIntoView({ behavior: "instant", block: "start" })
      await doRefresh(true)
    })()
  })

  await risuai.onUnload(async () => {
    await unwireButton()
    await unwireScroll()
    await button.remove().catch(() => undefined)
    await styleElement.remove().catch(() => undefined)
  })

  await doRefresh(true)
}
