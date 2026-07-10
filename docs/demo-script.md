# Touchline Relay — 3-minute demo script

**Goal:** one continuous take, unlisted YouTube/Vimeo, under 3:00.  
**Build:** `main` @ latest (verify `git pull` first).  
**Layout:** two windows side by side — **Organizer (left)** / **Receiver (right)**.

---

## Setup (before record, not on camera)

```bash
cd touchline-relay
git pull
npm install   # if needed

# Terminal 1
npm start -- --storage ./demo-a

# Terminal 2
npm start -- --storage ./demo-b
```

- Room key (type exactly the same on both): `saturday-final`
- Organizer: Target language **Spanish** (or **French** if you want the multi-lang beat)
- Wait until **both** show **1 peer** before you press record
- Optional: run one dry translate once so Bergamot is already cached (faster on camera)

**Do not** click “Sample row” during the live demo.  
**Do not** use `?demo=1` — that is a design mock, not live network.

---

## Shot list + voiceover (exact words)

### 0:00–0:18 · Problem

**Screen:** Both apps idle, side by side. Point at empty history on receiver.

**Say (calm, no hype):**

> “At a grassroots tournament, a pitch change usually gets copy-pasted through WhatsApp, a team app, and email. If the team is bilingual, someone has to translate it again. That delay is when people miss the gate.”

---

### 0:18–0:40 · What this is

**Screen:** Cursor on wordmark + top health chips (Translation / Relay).

**Say:**

> “Touchline Relay is a desktop tool for one job only. Write a matchday alert once, translate it on this machine with QVAC, and send both languages straight to joined peers over Pear and Hyperswarm — with no application server.”

---

### 0:40–1:00 · Join the room

**Screen:**  
1. Organizer: room `saturday-final` → **Join room**  
2. Receiver: same room → **Join room**  
3. Wait until both show **1 peer** / Relay healthy

**Say:**

> “Both devices join the same room. PearRuntime runs the networking worker. Hyperswarm connects the peers. Discovery still needs network reachability — this is direct P2P, not a promise of fully offline LAN magic.”

---

### 1:00–1:35 · Compose + local translate

**Screen (organizer only):**  
1. Click template **Kickoff delay** (or type the line manually)  
2. Venue **Pitch 2**, priority **Urgent**  
3. Target **Spanish · ES** (or French)  
4. Click **Translate locally**  
5. Hold on the bilingual preview until Ready

**Say:**

> “I load a real matchday line. Translate locally. That call hits QVAC Bergamot on the organizer’s machine — not a cloud translation API. Venue and priority stay structured fields so the ops data doesn’t get lost in free text.”

**If Spanish, expected shape (wording may vary slightly):**  
`Kickoff se traslada…` / meet at north gate style Spanish.  
**If French, verified live:**  
`Kickoff se déplace à Pitch 2 à 14:30. Rendez-vous à la porte nord.`

---

### 1:35–2:10 · Publish + receive

**Screen:**  
1. Organizer: **Publish to room**  
2. Receiver: Announcements list fills with EN + translated line  
3. Organizer: note says local relay accepted; button shows **Published**

**Say:**

> “One publish. The structured announcement goes through the Pear worker, across the Hyperswarm room, and lands on the second peer with both languages. Publish means the local relay accepted it. Peer receipts show up when a connected peer ACKs — not a claim that every device on earth got it.”

---

### 2:10–2:35 · Proof + honesty

**Screen:** Open **Proof** drawer. Point at model, room, peers, event log. Optionally **Export**.

**Say:**

> “Proof is for judges and operators: model lifecycle, room, peer count, event log. No cloud API key. History stays on this device. If you need to hand evidence to someone later, export the proof bundle.”

---

### 2:35–2:55 · Boundary + close

**Screen:** Split view, both windows still showing the same alert.

**Say:**

> “We cut wallets, betting, and full tournament admin on purpose. The crowded board already has those. Touchline Relay is the matchday radio: one urgent update, translated privately, delivered directly to people who joined the room.”

**End card (2s, optional on-screen text):**  
`github.com/ShalyX/touchline-relay`

---

## Recording checklist

- [ ] Two real instances, separate storage  
- [ ] Both show **1 peer** before publish  
- [ ] Real translate (not sample fixture)  
- [ ] Receiver shows bilingual history  
- [ ] You said “local relay acceptance” once  
- [ ] You did **not** claim fully offline discovery  
- [ ] Under 3:00  
- [ ] Unlisted upload → paste URL into DoraHacks  

## If something fails on camera

| Failure | Recovery |
| --- | --- |
| 0 peers after 20s | Leave + rejoin both; confirm same room spelling |
| Translate slow | Wait; first language pair download can take time |
| Wrong language | Change Target, retranslate, then publish |
| Publish disabled | Preview must be Ready (edit stale → retranslate) |

## Backup B-roll (only if needed)

Silent 10s: Proof drawer + invite filter **Urgent** on receiver. No new claims.
