# Touchline Relay submission draft

> Status: **verified MVP evidence as of 10 July 2026** on Linux x64. Claims below match live `npm test`, `npm run lint`, `npm run package`, QVAC smoke, and two-instance Electron CDP QA. Demo video still needs recording and a DoraHacks upload link.

## Paste-ready DoraHacks fields

### Project name

Touchline Relay

### Tagline

Translate matchday alerts on the organizer's device, then relay them directly to tournament peers.

### One-line pitch

Touchline Relay is a desktop alert tool for grassroots football tournaments: an organizer writes one venue, timing, or safety update, QVAC translates it locally, and PearRuntime with Hyperswarm sends the original and Spanish translation directly to joined peers without an application server.

### Tracks

- QVAC
- Pears

### Tags

Local AI, peer-to-peer, football, accessibility, tournament operations

### Short description

Grassroots tournament updates often end up split across chat groups, email, and team apps. When notifications arrive late or an app fails at a crowded venue, teams and volunteers can miss a pitch change or check-in instruction.

Touchline Relay narrows that problem to one critical action. The organizer selects a venue and priority, writes a short alert, translates it from English to Spanish on-device with QVAC Bergamot, previews both versions, and publishes the structured alert to a shared Pear room. A second app instance receives it through Hyperswarm and keeps it in local announcement history.

There is no cloud translation API, account system, application server, wallet, or general chat feed. Network reachability is still required for Hyperswarm peer discovery. The product does not claim guaranteed offline LAN discovery.

## About the project

### What it does

Touchline Relay gives a grassroots tournament organizer one place to send a bilingual operational notice:

1. Join a tournament room.
2. Choose a venue tag, priority, and Spanish as the target language.
3. Write a short announcement.
4. Translate it locally with QVAC Bergamot.
5. Preview the English and Spanish text.
6. Publish the structured alert to joined peers through a PearRuntime worker and Hyperswarm.
7. Keep received notices in local history.

The first version handles typed English-to-Spanish alerts only. It is not a tournament management suite or a chatbot.

### The problem

Current football coordination tools can fail at the moment an update matters. Recent public reviews describe team chats that do not load, notifications that never arrive, and event alerts arriving many hours late. Grassroots organizers also report juggling WhatsApp, spreadsheets, and scattered messages.

That is more than an inconvenience when the message is “Pitch 3 is delayed 20 minutes” or “Check in at the blue tent.” Multilingual teams add another delay because someone must copy, translate, and resend the same update.

Touchline Relay is built around the message, not around another social feed. Structured venue and priority fields remain unambiguous; the short instruction is translated locally; both versions travel together.

### Why QVAC and Pears are necessary

QVAC is responsible for the translation itself. Electron main loads the Bergamot English-to-Spanish model and produces the translated body locally, without a cloud AI endpoint or API key. Removing QVAC would remove the local translation proof.

PearRuntime is the load-bearing worker runtime. Its Bare worker owns Hyperswarm room membership and announcement broadcast. Removing Pears would turn the product back into a conventional server-backed notification tool.

### How it is built

Three narrow boundaries:

- A sandboxed vanilla HTML/CSS/JS renderer handles room join, composition, preview, publish, status, and local history.
- Electron main owns the QVAC SDK lifecycle through a limited preload API (`BERGAMOT_EN_ES`).
- A worker launched with `PearRuntime.run` owns Hyperswarm. It accepts structured join/publish commands and emits peer, status, and announcement events.

Pure protocol code validates announcements, derives the room key with `hypercore-crypto`, serializes NDJSON wire messages, and rejects duplicates. The UI exposes QVAC and P2P health plus a Proof drawer for judges.

### Competition position

A scan of the 16 visible DoraHacks submissions on 9 July 2026 found a field dominated by WDK and football betting or shared-money products. Eight of the 16 had prediction or betting as a primary or substantial workflow. Three described meaningful Pear/Holepunch networking for other jobs. None visibly demonstrated QVAC SDK local inference for bilingual tournament operations.

Touchline Relay avoids the crowded wallet/escrow/prediction categories and uses QVAC + Pears as load-bearing steps in one workflow.

### Challenges and tradeoffs

- Hyperswarm is serverless peer-to-peer networking, but discovery still needs network reachability.
- The QVAC model may require a one-time download before cached local use.
- Translation quality is operational, not human-editor grade. Venue identifiers stay structured.
- Packaging must restore the unstripped QVAC native prebuild; Electron Forge otherwise truncates the Linux Vulkan shared library.
- Publish success means **local relay acceptance**, not universal receipt.

### What's next

1. Record the three-minute unlisted demo with two live instances.
2. Test discovery on real venue Wi-Fi / phone hotspots.
3. Add more languages only with a proven local model path.
4. Mobile receivers later—without moving translation to the cloud.

## Honest evidence ledger

### Implemented and verified

- Custom Touchline Relay editorial UI with Crossing-the-line mark, warm `#FF714A` accent, top health bar, Proof drawer, bilingual preview, announcement history.
- BrowserWindow default `1280×800`, minimum `760×620`.
- Structured announcement protocol, validation tests, room-key derivation, duplicate rejection.
- QVAC Bergamot EN→ES in Electron main (`lib/qvac-translator.js` + smoke script).
- PearRuntime worker + Hyperswarm relay (`workers/main.js`, `workers/relay-node.js`).
- Custom `--storage` allows two app instances (instance policy helper + tests).
- Stale preview after edit; publish disabled until retranslation; room committed only after worker `joined`.
- Fixture/sample path isolated from real health state.
- Forge `postPackage` restores QVAC prebuilds byte-for-byte.
- `npm test`: **16/16 pass**.
- `npm run lint`: exit 0.
- `npm run package`: produces `out/Touchline Relay-linux-x64/`.
- Live two-instance Electron QA (separate storage, CDP):
  - peers join same room and each shows **1 peer**
  - local translation example: `Kickoff se traslada a Pitch 2 a las 14:30. Reúnase en la puerta norte.`
  - receiver history shows English + Spanish structured announcement
  - publisher records local relay acceptance; Publish becomes disabled/`Published`

### Still open for submission packaging

- Unlisted three-minute demo video URL
- Optional release artifact upload
- Final DoraHacks form paste after video

## Three-minute demo narrative

> Demo status: operator script for the verified build. Cache Bergamot first. Use two instances with separate storage. Never swap in a fixture while narrating a live path.

### 0:00–0:20 | Problem

**On screen:** Organizer left, receiver right.

**Say:** “A pitch change at a grassroots tournament often gets copied across a team app, WhatsApp, and email. Add a second language and the same urgent message gets delayed again. Touchline Relay reduces that to one bilingual alert, translated on this device and sent directly to tournament peers.”

### 0:20–0:40 | Real paths

**On screen:** Join both to the same room. Show Local translation and P2P health until each lists **1 peer**.

**Say:** “QVAC runs English-to-Spanish translation in Electron main. PearRuntime runs the networking worker, and Hyperswarm connects peers without an application server. Discovery still needs network reachability—this is serverless P2P, not guaranteed offline LAN messaging.”

### 0:40–1:15 | Compose + translate

**On screen:** Venue `Pitch 2`, priority `Urgent`, body: `Kickoff moves to Pitch 2 at 14:30. Meet at the north gate.` Click **Translate locally**. Wait for real Spanish.

**Say:** “This call goes to the QVAC Bergamot model on the organizer’s machine, not to a cloud translation API.”

### 1:15–1:45 | Publish + receive

**On screen:** **Publish to room**. Receiver history fills with English + Spanish. Organizer shows local relay acceptance.

**Say:** “I publish once. The structured announcement enters the Pear worker, crosses the Hyperswarm room, and appears on the second peer with both language versions. Publish means local relay acceptance—not a promise every peer already received it.”

### 1:45–2:15 | Proof drawer

**On screen:** Open **Proof**. Show model name, lifecycle, room, peer count, event log.

### 2:15–3:00 | Boundary + close

**Say:** “Touchline Relay is intentionally small. No brackets, accounts, payments, or chat. One failure-prone tournament action: write an operational update once, translate it privately, and deliver both versions directly to reachable peers.”

## Final submission links

- Public repository: https://github.com/ShalyX/touchline-relay
- Demo video: `[ADD FINAL UNLISTED VIDEO URL]`
- Linux package path (local): `out/Touchline Relay-linux-x64/`
- Commit demonstrated: `76c1aa670671b5c5f66d905b388c367e3eac882d`
- Test evidence: `npm test` 16/16; `npm run lint` 0; package + two-peer CDP QA on 2026-07-10
