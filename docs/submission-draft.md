# Touchline Relay submission draft

> Status: **product + evidence ready as of 10 July 2026**. Demo video URL is the only hard remaining submit field.  
> Repo: https://github.com/ShalyX/touchline-relay · documented from tree prior to this docs commit; after push use latest `main` (`git rev-parse HEAD`).

## Paste-ready DoraHacks fields

### Project name

Touchline Relay

### Tagline

Local QVAC translation + direct Pear/Hyperswarm delivery for matchday alerts.

### One-line pitch

A desktop matchday tool: write one operational alert, translate it on-device with QVAC Bergamot, and relay both languages to joined peers over PearRuntime and Hyperswarm — with no application server.

### Tracks

- QVAC  
- Pears  

### Tags

Local AI, peer-to-peer, football, tournament operations, accessibility

### Short description (form body)

Grassroots tournament updates get lost across WhatsApp, team apps, and email. Add a second language and the same urgent pitch change is delayed again.

Touchline Relay is a desktop app for one job: an organizer joins a room, composes a short structured alert (venue + priority + message), translates it locally with QVAC Bergamot (English → Spanish, French, German, or Portuguese), previews both versions, and publishes to joined peers through a PearRuntime worker and Hyperswarm. A second instance receives the bilingual announcement into local history. Peer ACKs record receipts from connected peers only.

No cloud translation API, no application server, no wallet, no betting, no general chat. Hyperswarm discovery still needs network reachability — serverless P2P, not guaranteed offline LAN messaging.

### How to run (judges)

```bash
git clone https://github.com/ShalyX/touchline-relay.git
cd touchline-relay
npm install
npm start -- --storage ./peer-a
# second terminal:
npm start -- --storage ./peer-b
```

Join the same room on both → wait for 1 peer → Translate locally → Publish.

Full demo voiceover: `docs/demo-script.md`

---

## About the project

### What it does

1. Join a matchday room  
2. Pick venue, priority, and target language  
3. Write (or pick a template for) a short English alert  
4. Translate on-device with QVAC Bergamot  
5. Preview original + translation  
6. Publish structured announcement via Pear worker + Hyperswarm  
7. Receiver sees bilingual history; optional desktop notification  
8. Leave room without restart; copy invite; filter history; export proof  

### Why QVAC and Pears are necessary

- **QVAC** performs the translation on the organizer machine. Without it, there is no local bilingual proof.  
- **PearRuntime + Hyperswarm** own room membership and direct delivery. Without them, this collapses to a normal server-backed notifier.

### Competition position

Visible DoraHacks field (early scan) was heavy on WDK / betting / shared-money. Touchline Relay avoids that crowd and uses QVAC + Pears as required steps in one operational workflow.

### Challenges and tradeoffs

- Discovery needs network reachability  
- First model download/cache can take time  
- Bergamot quality is operational, not editor-grade  
- Electron Forge can truncate QVAC native libs — fixed via postPackage restore  
- Publish = local relay acceptance; ACKs = connected peer receipts only  

### What's next (post-hackathon)

Real venue Wi-Fi stress tests, signed room invites, mobile receiver companion, CI installers for Windows/macOS. WDK/marketplace stay out of this product unless a real payment workflow appears.

---

## Evidence ledger (verified)

| Item | Evidence |
| --- | --- |
| Unit/integration tests | `npm test` — 22 pass |
| Lint | `npm run lint` exit 0 (warnings only) |
| Package | `npm run package` → `out/Touchline Relay-linux-x64/` |
| QVAC packaging restore | postPackage hook; smoke path |
| EN→ES live desktop | CDP two-peer; Spanish preview + receive |
| EN→FR live desktop | CDP two-peer; `BERGAMOT_EN_FR`; FR on receiver history |
| Multi-lang wiring | ES / FR / DE / PT in translator + UI |
| Leave room | Worker `leave` + UI |
| Peer ACKs | Wire `ack` + history receipts |
| Templates / filters / invite / notify / export | UI + main notify IPC |
| MIT license | `LICENSE` |

### Still open (human)

- [ ] Record unlisted ≤3 min video using `docs/demo-script.md`  
- [ ] Paste video URL below  
- [ ] Submit DoraHacks form before **2026-07-15 07:59**  

---

## Final submission links

- Public repository: https://github.com/ShalyX/touchline-relay  
- Demo video: `[ADD UNLISTED VIDEO URL]`  
- Demo script: `docs/demo-script.md`  
- Installer notes: `scripts/make-release-notes.md`  
- Roadmap (cuts): `docs/roadmap.md`  
- Commit base for this write-up: parent of docs commit; after pull use `git rev-parse --short HEAD`
- Known good FR e2e commit family: `9abfb8c`+  

## DoraHacks submit checklist

1. Project name + tagline + short description (above)  
2. Tracks: **QVAC**, **Pears**  
3. Repo URL  
4. Demo video URL  
5. Optional: package zip / screenshots from `/tmp/touchline-fr-*.png` or live UI  
6. Confirm claims match demo (no offline-guarantee, no universal delivery)
