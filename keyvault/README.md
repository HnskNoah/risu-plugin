# KeyVault

> ## ⚠️ 不可用
>
> 本插件目前**不可用**,请勿在生产环境导入使用。
>
> **已知问题**:流式对话请求已正常发出(服务商/中转日志显示调用成功、SSE 数据正常返回),但 RisuAI 界面会一直停留在「发送中」状态,回复内容无法结束。本地测试环境已拆除,问题尚未定位修复。
>
> 状态跟踪见 [todolist.md](todolist.md)。

RisuAI v3 插件:统一管理多个 OpenAI 兼容服务商的 API Key,每个配置注册为独立模型条目,角色里直接选择即可使用。

## 功能

- **集中管理 Key**:一个面板管理多家服务商,所有角色共用;Key 只存本机浏览器
- **免手填模型**:每个配置注册为模型条目(显示名为配置名,如 `DeepSeek V4`),角色模型下拉的 **Plugins 组** 里选择
- **自动拉取模型列表**:填好 API 地址和 Key 后一键刷新 `/models`
- **自动推断 tokenizer**:按默认模型名自动选择(DeepSeek V4 / Claude / Gemini / GPT / Llama / Mistral / GLM 等)
- **模型名去前缀**:可勾选去掉模型名第一段前缀(如 `gcli-gemini-3.1-pro-preview` 请求时发 `gemini-3.1-pro-preview`),tokenizer 推断同样按去前缀后的名字
- **流式输出**:默认开启,可逐配置关闭
- **主/辅助模型分离**:主模型、记忆模型、辅助模型各选各的条目

## 使用(设计流程)

1. 构建:`npm install && npm run build`(产物 `dist/keyvault.js`)
2. RisuAI → 设置 → 插件 → 导入 `dist/keyvault.js`
3. 设置里打开 **🔑 KeyVault 配置** 面板
4. 点预设(DeepSeek / OpenAI / Claude / GLM / Kimi / MiniMax / MiMo)或「自定义」
5. 填 API 地址(如 `https://api.deepseek.com/v1`,不含 `/chat/completions`;无协议时自动补 `https://`)、API Key
6. 点「刷新」拉取模型列表,选择默认模型;名称留空或为「自定义」时,填地址/刷新会自动按域名填入名称
7. 点底部「保存」,草稿自动进入配置列表 → **重新加载插件** 生效
8. 角色设置 → 模型下拉 → **Plugins 组** → 选配置名

## 已知问题

- **流式请求后 RisuAI 一直「发送中」**(当前阻断问题):请求与 SSE 数据均正常,回复无法正常结束
- 配置修改后需重新加载插件生效(`addProvider` 无注销 API;重载后旧条目可能残留,需重启 RisuAI)
- 首次使用会弹 provider 权限授权,之后每 3 天重新确认(由 RisuAI 机制决定)
- 服务商 API 需支持 CORS(本地 vLLM 等需自行开启)
- Key 明文存储在本机浏览器
- 仅转发文本,图片/multimodal 不转发
- 只影响选用插件条目的角色;RisuAI 内置 provider 流程不变

## 开发

```bash
npm run dev        # watch 模式,自动重建 dist/keyvault.js
npm run build      # 一次性构建
npm run typecheck  # TypeScript 检查
```
