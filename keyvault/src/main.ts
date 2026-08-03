import "./styles.css"
import { PLUGIN_DISPLAY_NAME } from "./constants/plugin"
import { registerAllProviders } from "./helpers/providers"
import { renderPanel } from "./ui/panel"

let registrationError: string | null = null

try {
  await registerAllProviders()
} catch (error) {
  registrationError = error instanceof Error ? error.message : "Unknown error"
  console.error(`[${PLUGIN_DISPLAY_NAME}] provider registration failed: ${registrationError}`)
}

const openPanel = async (): Promise<void> => {
  await risuai.showContainer("fullscreen")
  const closePanel = (): void => {
    void risuai.hideContainer()
  }
  try {
    await renderPanel(document.body, closePanel)
    if (registrationError !== null) {
      const banner = document.createElement("div")
      banner.style.cssText =
        "padding:10px 14px;margin-bottom:12px;border-radius:10px;border:1px solid rgba(234,179,8,.5);" +
        "background:rgba(234,179,8,.12);color:CanvasText;font-size:.85rem;line-height:1.5"
      banner.textContent = `KeyVault 配置加载失败:${registrationError}。请检查浏览器存储权限后重载插件。`
      document.body.prepend(banner)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown plugin error"
    console.error(`${PLUGIN_DISPLAY_NAME} failed to open panel`, error)
    document.body.innerHTML = `<div class="kv-root"><p style="color:#ef4444">打开面板失败:${message}</p></div>`
  }
}

await risuai.registerSetting(
  `${PLUGIN_DISPLAY_NAME} 配置`,
  openPanel,
  '<span aria-hidden="true">🔑</span>',
  "html",
  "keyvault-settings",
)
