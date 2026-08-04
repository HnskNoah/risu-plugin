import { PLUGIN_DISPLAY_NAME } from "./constants/plugin"
import { initializeJumpButton } from "./helpers/jump-button"

try {
  await initializeJumpButton()
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error(`[${PLUGIN_DISPLAY_NAME}] initialization failed: ${message}`)
}
