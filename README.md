# risu-plugin

RisuAI v3 插件集合。

> **⚠️ 免责声明**:仓库内所有代码均由 AI(Vibe Coding)生成,未经过严格测试或审计。可用但不保证正确性、稳定性或安全性,**使用即自行承担风险,作者不负责**。请先阅读源码再导入使用。

| 插件 | 目录 | 状态 | 说明 |
|---|---|---|---|
| **KeyVault** | [`keyvault/`](keyvault/) | ⚠️ 不可用 | 多服务商 API Key 统一管理 |
| **Todown** | [`todown/`](todown/) | ✅ 可用 | 聊天页常驻「跳转至最新」按钮 |

## 用户脚本

| 脚本 | 目录 | 说明 |
|---|---|---|
| **RisuRealm Wishlist** | [`RisuRealm脚本/`](RisuRealm脚本/) | RisuRealm 卡片爱心收藏 + 本地导入/导出心愿单(需 Tampermonkey 等油猴扩展) |

## 构建

每个插件独立工程:

```bash
cd keyvault   # 或 todown
npm install
npm run build          # 产物 dist/<name>.js
npm run typecheck
npm run dev            # watch 模式
```

## 安装

RisuAI → 设置 → 插件 → 导入对应 `dist/<name>.js`。

> 插件运行在沙箱 iframe 中,首次使用 provider 相关功能会弹出权限确认,之后每 3 天重新确认一次;插件代码更新后需重新授权。
