# Why Touchline Relay

Research snapshot: 9 July 2026. Scores are 1–10. `Implementation safety` means lower risk / more likely to ship in the remaining time.

| Concept | Originality | Feasibility | Sponsor fit | Demo strength | User usefulness | Implementation safety | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Touchline Relay — local translation + direct alert relay** | 9 | 8 | 10 | 10 | 8 | 8 | **53** |
| PitchLink — offline-first matchday room | 7 | 9 | 9 | 10 | 9 | 9 | **53** |
| BenchBrief — local drill-card generator | 7 | 9 | 10 | 8 | 8 | 9 | **51** |
| Private Local Match Analyst | 9 | 5 | 10 | 10 | 9 | 5 | **48** |
| RefPay — referee assignment and settlement | 8 | 6 | 9 | 9 | 9 | 6 | **47** |

## Decision

Build **Touchline Relay**.

It ties PitchLink on raw score but has a stronger competition position: no visible submission demonstrates real QVAC SDK inference, only three visible submissions describe meaningful Pear usage, and none combines local translation with operational one-to-many tournament notices. Both sponsor technologies are load-bearing and visible in a two-minute demo.

## One-sentence sponsor fit

Touchline Relay uses QVAC to translate a tournament announcement entirely on the organizer's device, then uses PearRuntime and Hyperswarm to deliver the original and translation directly to joined peers without an application server.

## Smallest version that can win

- **User:** grassroots tournament organizer coordinating multilingual teams and volunteers.
- **Pain:** important venue, timing, and safety changes get delayed or fragmented across unreliable centralized team apps and chat groups.
- **Workflow:** join room → choose venue/priority → type one update → translate locally → preview → publish directly to peers.
- **Must have:** real QVAC Bergamot translation, real Pear worker, real Hyperswarm exchange, local history, visible runtime status.
- **Cut:** wallets, chat, schedules, accounts, speech, full tournament management, analytics, cloud sync.
- **Demo moment:** show a Spanish translation produced locally with no API key, then receive the bilingual alert in a second app instance through the Pear room.

## Brutal risks

- Hyperswarm discovery is serverless P2P, not guaranteed offline LAN discovery. Product copy must not claim otherwise.
- Translation quality should be demonstrated on short operational sentences; venue identifiers remain structured tags instead of being translated.
- Running QVAC inside the Bare worker adds unnecessary compatibility risk, so QVAC belongs in Electron main while PearRuntime remains responsible for networking.
- Two-track ambition is only justified because the integration remains one narrow workflow. No third track.
