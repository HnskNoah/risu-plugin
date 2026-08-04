# todown

Risuai API v3 plugin: an always-visible "jump to latest" button pinned to the bottom-left corner of the chat screen.

- Clicking the button scrolls to the newest message (same behavior as Risuai's built-in jump button, which is normally hidden until you scroll up).
- When already at the latest message, the button fades to 40% opacity; it fades back when you scroll away.
- Works on desktop and mobile (48px touch target, `env(safe-area-inset-bottom)` offset, responsive layout).
- DOM selectors mirror Risuai's own source (`DefaultChatScreen.svelte` / `Chats.svelte`): the chat body is `flex-col-reverse`, so the newest message is the first `.risu-chat` child.

## Build

```bash
npm install
npm run build        # produces dist/todown.js
npm run dev          # watch mode: rebuilds dist/todown.js on change
npm run typecheck
```

## Install

1. Open Risuai → Settings → Plugins.
2. Import the file `dist/todown.js` (or use file-based hot reload during development).

## Notes / Limitations

- Requires the default chat screen (`.default-chat-screen`); other chat screen variants aren't supported.
- The plugin injects its button into Risuai's main document. If the main document is unavailable, the button stays hidden and nothing is broken.
- On re-import the plugin self-cleans: duplicate button injection is prevented and DOM is removed on unload.

## Files

- `src/main.ts`: plugin entry.
- `src/helpers/jump-button.ts`: all logic (button injection, jump, at-bottom state, observers, cleanup).
- `src/constants/plugin.ts`: plugin constants.
- `src/types/risuai.d.ts`: vendored Risuai API v3 declaration snapshot.
