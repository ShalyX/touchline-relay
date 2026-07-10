# Touchline Relay

**Translate one tournament alert locally with QVAC, then deliver the bilingual update directly to joined peers through PearRuntime and Hyperswarm—without an application server.**

Touchline Relay is a desktop matchday tool for grassroots football tournaments. An organizer writes a short operational update, translates it from English to Spanish on-device with QVAC Bergamot, previews both versions, and publishes a structured announcement to a shared room. A second app instance receives it over Hyperswarm and keeps it in local history.

## Why this exists

Tournament updates often get lost across WhatsApp, email, and team apps. When a pitch changes or check-in moves, late or fragmented messages cost volunteers and teams real time. Touchline Relay keeps one critical action: compose → translate locally → publish to reachable peers.

## Sponsor stack (load-bearing)

| Layer         | Technology                      | Role                                                     |
| ------------- | ------------------------------- | -------------------------------------------------------- |
| Local AI      | **QVAC SDK** + `BERGAMOT_EN_ES` | English → Spanish translation on the organizer’s machine |
| Desktop shell | **Electron** (Forge package)    | UI + main-process QVAC lifecycle                         |
| P2P runtime   | **PearRuntime** / Bare worker   | Owns Hyperswarm membership and relay                     |
| Networking    | **Hyperswarm**                  | Direct peer delivery of structured announcements         |

There is no cloud translation API, application server, account system, wallet, or general chat feed.

### Honest network language

- Translation runs **locally** after the Bergamot model is cached.
- Messages travel **directly between reachable peers**.
- Peer **discovery still requires network reachability** (Hyperswarm bootstrap / DHT). This is not claimed as fully offline LAN messaging.

## Demo workflow (about 2 minutes)

1. Launch two instances with separate `--storage` paths.
2. Join the same room name on both.
3. Wait until each shows **1 peer**.
4. On the organizer: set venue + priority, write an English alert, click **Translate locally**.
5. Confirm Spanish preview and **Publish to room**.
6. On the receiver: the bilingual structured announcement appears in **Announcements**.

## Prerequisites

- Linux x64 recommended for the verified package path (this repo also carries macOS/Windows packaging config from the Pear Electron starter).
- Node.js 20+ and npm.
- Network access for first-time dependency install and QVAC model download/cache.
- A display (or Xvfb) to run the Electron UI.

## Setup

```bash
git clone https://github.com/ShalyX/touchline-relay.git
cd touchline-relay
npm install
```

If Electron fails to install:

```bash
rm -rf node_modules/electron
npm rebuild electron
```

## Run

Development:

```bash
npm start -- --storage /tmp/touchline-a
```

Second peer (required for the demo; custom storage bypasses the single-instance lock):

```bash
npm start -- --storage /tmp/touchline-b
```

Root / hermesbox (this machine runs as root):

```bash
# always pass --no-sandbox as root (also baked into npm start)
npm start -- --storage /tmp/touchline-a

# no display / SSH headless:
xvfb-run -a npm start -- --storage /tmp/touchline-a
```

Demo helpers:

```bash
npm run start:demo-a
npm run start:demo-b
```

Optional Chromium remote debugging (used by automated QA):

```bash
npm start -- --storage /tmp/touchline-a --remote-debugging-port 9222
```

## How users get the app

This is a **desktop app**, not a website. Users install/run it on their machine (organizer laptop, ops desk, second peer device).

### Option A — from source (MVP / hackathon)

```bash
git clone https://github.com/ShalyX/touchline-relay.git
cd touchline-relay
npm install
npm start -- --storage ./data-organizer
```

Another peer (second machine or second terminal):

```bash
npm start -- --storage ./data-peer
```

Join the **same room key** on both. Translate on the organizer. The peer receives the bilingual alert.

### Option B — packaged binary

```bash
npm run package
# Linux:
# out/Touchline Relay-linux-x64/Touchline Relay
```

Zip that folder (or build installers later) and hand it to users. No account, no cloud API key, no app server.

### What “local” does _not_ mean

- Not “terminal only forever” — Electron is a normal desktop UI.
- Not “offline guaranteed” — peer discovery still needs network reachability.
- Not multi-tenant SaaS — there is no hosted production URL in this MVP.

Static design preview (populated mock, not live network): open `renderer/index.html?demo=1` in a browser.

## Verify

```bash
npm test
npm run lint
npm run qvac:smoke
npm run package
```

What those mean:

- `npm test` — protocol, renderer state, instance policy, QVAC translator unit tests, and a two-peer Hyperswarm structured-announcement integration test.
- `npm run qvac:smoke` — real local Bergamot EN→ES translation via `@qvac/sdk`.
- `npm run package` — Electron Forge package plus a **postPackage** hook that restores the unstripped QVAC native prebuild (Forge otherwise truncates the Vulkan shared library).

Packaged Linux app:

```text
out/Touchline Relay-linux-x64/Touchline Relay
```

## Architecture

```text
┌──────────────────────────────┐
│ Renderer (vanilla HTML/CSS/JS)│
│ room · compose · preview · UI │
└──────────────┬───────────────┘
               │ preload bridge
┌──────────────▼───────────────┐
│ Electron main                │
│ QVAC load/translate/unload   │
│ PearRuntime.run(worker)      │
└──────────────┬───────────────┘
               │ framed IPC
┌──────────────▼───────────────┐
│ Bare worker (PearRuntime)    │
│ Hyperswarm room join/publish │
│ structured NDJSON wire msgs  │
└──────────────────────────────┘
```

Key source:

- `electron/main.js` — window, QVAC IPC, Pear worker lifecycle, multi-instance policy
- `lib/qvac-translator.js` — official Bergamot EN→ES path
- `lib/protocol.js` — room key, validation, wire format, duplicate filter
- `workers/main.js` + `workers/relay-node.js` — Pear/Bare relay
- `renderer/` — editorial desktop UI (“Crossing the line” mark, proof drawer)

## Verified evidence (this build)

Independently verified on Linux x64:

- **16/16** automated tests pass.
- Lint exits 0 (existing `require-await` warnings only).
- QVAC smoke produces real Spanish output.
- Packaging preserves QVAC native library byte-for-byte vs `node_modules`.
- Two Electron instances with separate storage:
  - join the same room and see **1 peer** each
  - organizer translates with local QVAC Bergamot
  - receiver history shows English + Spanish structured announcement
  - publisher records **local relay acceptance** only (not universal delivery)

Example translated line from live UI QA:

> Kickoff se traslada a Pitch 2 a las 14:30. Reúnase en la puerta norte.

Bergamot quality is operational, not human-editor grade. Venue tags stay structured so names remain unambiguous.

## Limitations

- English → Spanish only in MVP.
- No leave-room beyond process restart in MVP.
- No end-to-end delivery receipts from every peer—only local relay acceptance + observed peer receive.
- First model download can take time; keep the demo script ready for a cached model.
- Packaging fix is especially important on Linux x64 for `@qvac/translation-nmtcpp`.

## License

MIT. Bootstrapped from the official [holepunchto/hello-pear-electron](https://github.com/holepunchto/hello-pear-electron) starter architecture, then rebuilt for Touchline Relay.

## Docs

- `docs/decision.md` — concept selection
- `docs/design-brief.md` — UI specification
- `docs/submission-draft.md` — DoraHacks paste-ready copy
