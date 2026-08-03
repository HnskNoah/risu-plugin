# KeyVault

RisuAI v3 插件:统一管理多个 OpenAI 兼容服务商的 API Key,自动生成模型条目,无需手动填写模型类型。

## 功能

- **集中管理 Key**:一个面板管理多家服务商,所有角色共用;Key 只存本机浏览器
- **免手填模型**:每个配置注册为 `pluginmodel:::km_<id>` 模型条目,角色模型下拉里选择即可
- **自动拉取模型列表**:填好 API 地址和 Key 后一键刷新,从 `/models` 接口获取
- **自动推断 tokenizer**:按默认模型名自动选择分词器(DeepSeek V4 / Claude / Gemini / GPT / Llama / Mistral / GLM 等),上下文裁剪更准确
- **流式输出**:默认开启,可在面板关闭
- **主/辅助模型分离**:主模型、记忆模型、辅助模型各选各的条目,各自独立工作

## 使用

1. 构建:`npm install && npm run build`(产物 `dist/keyvault.js`;开发用 `npm run dev` 监听)
2. RisuAI → 设置 → 插件 → 导入 `dist/keyvault.js`
3. 设置里打开 **KeyVault 配置** 面板
4. 添加服务商:填名称、API 地址(如 `https://api.deepseek.com/v1`,不含 `/chat/completions`)、API Key
5. 点「刷新」拉取模型列表,选择默认模型
6. 保存 → **重新加载插件**(配置变更需重载才生效)
7. 角色设置 → 模型下拉选择 `pluginmodel:::km_xxx`(主模型 / 记忆模型 / 辅助模型均可)

## 注意事项

- 首次使用会弹出 provider 权限授权;之后每 3 天重新确认一次(由 RisuAI 机制决定,无法关闭)
- **插件代码更新后需重新授权**(权限绑定脚本内容)
- 服务商 API 需支持 CORS(本地 vLLM 等需自行开启 CORS)
- Key 以明文存储在本机浏览器 localStorage(与 RisuAI 原生 Key 存储方式相同)

## 开发

```bash
npm run dev        # watch 模式,自动重建 dist/keyvault.js
npm run build      # 一次性构建
npm run typecheck  # TypeScript 检查
```

## 已知限制

- 配置修改后需重新加载插件生效(`addProvider` 无注销 API)
- 仅转发文本内容,图片/multimodal 不转发
- 只影响选用 `pluginmodel:::*` 条目的角色;RisuAI 内置 provider 流程不变
