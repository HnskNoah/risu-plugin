# KeyVault — RisuAI API Key 管理器

## 项目定位

RisuAI v3 插件:接管 API 调用层,统一管理多个 OpenAI 兼容服务商的 key。
自动生成模型条目(免手填模型类型)、自动拉取模型列表、按模型名推断 tokenizer。

- 位置:`C:\Users\Latitude\Dev\rius\keyvault`;入口:仅设置项;显示名 **KeyVault**
- 产物 `dist/keyvault.js`(27 kB);面板中文;流式默认开;同服务商允许多配置

## 技术基线(compact,源码依据 risuai-src)

| # | 事项 | 结论 |
|---|---|---|
| 1 | key 传递 | `nativeFetch` 不剥离 Authorization;黑名单仅 risuai 自家域名;Anthropic 端点自动加 direct-browser-access 头 |
| 2 | 权限 | provider 首次弹窗、每 3 天重确认、绑定脚本 hash(改代码需重授权) |
| 3 | 模型条目 | `addProvider` 生成 `pluginmodel:::km_<id>`,`options.model.name` 显示名 |
| 4 | 流式 | RisuAI 消费纯文本 delta 流;插件解析 SSE yield delta.content |
| 5 | tokenizer | **设 `options.model.tokenizer`(枚举)**;pluginmodel 走 modelInfo fallback |
| 6 | 独立性 | 主/记忆/辅助模型 = 独立条目各自 tokenizer,天然分开 |
| 7 | 失败语义 | `{success:false, content:友好错误}`;console.error 带配置名+端点 |
| 8 | 存储 | `getLocalPluginStorage`,不可用降级 `safeLocalStorage`;key 明文本机 |

### 用到的 RisuAI v3 API(risuai 全局对象)
| API | 签名要点 | 用途 | 注意 |
|---|---|---|---|
| `addProvider` | `(name, func(arg, abortSignal), options?: { tokenizer?, tokenizerFunc?, model?: { name, shortName, fullName, tokenizer?, ... } })` | 注册自定义 provider,生成 `pluginmodel:::km_<id>` 模型条目 | func 需返回 `{success, content: string \| ReadableStream<string>}`;options.model.tokenizer 用 LLMTokenizer 枚举;无注销 API,改配置需重载插件 |
| `nativeFetch` | `(url, options?: RequestInit & { logFetch?, requestTimeoutMs? })` | 调 `/chat/completions`、`/models`;不剥 Authorization 头 | 黑名单仅 risuai 自家域名;敏感头仅警告;`logFetch:false` 避免进 fetch log |
| `getLocalPluginStorage` | `() => SafeLocalPluginStorage`(`getItem<T>`/`setItem<T>`) | 配置持久化(设备本地,不进存档) | 不可用时降级 `safeLocalStorage`(string 接口) |
| `safeLocalStorage` | 属性,`getItem/setItem` 仅 string | 存储降级路径 | 值需 JSON.stringify |
| `registerSetting` | `(name, callback, icon?, iconType?, id?)` | 设置入口打开配置面板 | 同 id 重复注册原位替换 |
| `showContainer` | `('fullscreen')` | 显示插件 iframe 面板 | 面板 DOM 在插件自己的 document |
| `hideContainer` | `()` | 关闭面板 | — |

### tokenizer 推断(按 defaultModel 名,未匹配→默认)
| 包含 | 枚举 |
|---|---|
| deepseek(含 v4) | DeepSeekV4 |
| claude | Claude |
| gemini | GoogleCloud(官方=gemma 分词) |
| gemma | Gemma |
| mimo | tiktokenCl100kBase(实为 Qwen2 风格 BPE,vocab 152576,无专用项取最接近) |
| gpt-4o/gpt-5/o1/o3 | tiktokenO200Base |
| gpt-3.5/gpt-4 | tiktokenCl100kBase |
| llama3 / llama | Llama3 / Llama |
| mistral | Mistral |
| glm | GLM5 |
| cohere | Cohere |
| 默认 | tiktokenO200Base |

### 预设(快速添加,填 key 即可用)
DeepSeek `api.deepseek.com/v1` · OpenAI `api.openai.com/v1` · Claude `api.anthropic.com/v1` · GLM `open.bigmodel.cn/api/paas/v4` · Kimi `api.moonshot.cn/v1` · MiniMax `api.minimax.chat/v1` · MiMo `api.xiaomimimo.com/v1`(未官方确认,可改)· 自定义

## 界面设计(2026-08-03 重构)

- **新建草稿卡片**(唯一):预设点击=切换草稿内容,不堆卡;填好点「加入配置列表」
- **配置列表**:折叠项(名称/模型/域名);点击行头展开编辑(改地址/Key/模型/流式/刷新模型);行尾删除
- **导入/导出**:导出含Key / 导出无Key(`keyvault-config.json`);导入校验+id 去重(文件内重复/与现有冲突自动重生成)
- 保存统一写 storage,提示重载生效;面板重开保留未保存编辑(cachedState)
- 移动端:16px 输入防 iOS 缩放、44px 触控、safe-area

## 实施状态

- [x] 脚手架/存储/注册/SSE/tokenizer/面板/README
- [x] 预设模板 + Anthropic 头 + 保存校验 + 日志可观测性 + 友好错误 + 移动适配
- [x] 界面重构(草稿卡片/配置列表/导入导出)
- [x] 简化:移除「加入配置列表」按钮,草稿填写完整后保存自动进列表
- [x] provider 名改用配置名(替代 km_xxx,重名加后缀;custom 模型下 Plugin 选择器显示配置名)
- [x] 分组管理:新建/删除分组;配置多选框勾选所属组(可多组);列表项显示组名
- [x] 自定义:填 API 地址后自动解析 host 填入名称;无协议地址自动补 https://
- [x] 复查修复:加入列表事件位置、存储 fallback、保存清空折叠配置(sync 折叠跳过)、导入 id 去重、面板状态缓存

## 验证清单(用户侧,待测)

- [ ] 导入 → 面板点预设 → 填 Key → 刷新模型 → 选默认 → 保存(草稿自动入列表)→ 重载
- [ ] 角色模型选 `pluginmodel:::xxx`(Plugins 组);不选 custom,避免 RisuAI 内置 Plugin 下拉框
- [ ] 记忆模型选另一 km 条目,验证独立
- [ ] 错 Key/坏地址 → 友好错误(界面+console)
- [ ] 导出→清空→导入,配置完整恢复
- [ ] 权限弹窗:首次 + 3 天周期

## 已知限制

- 服务商需 CORS(本地 vLLM 需自开);配置变更需重载插件;代码改动需重授权
- 仅文本转发(无 multimodal);只影响选用 `pluginmodel:::*` 的角色
