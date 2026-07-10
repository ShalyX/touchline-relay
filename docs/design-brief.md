# Touchline Relay — Premium Desktop UI Design Brief

## 1. Design intent

Touchline Relay should feel like a calm match-operations instrument: immediate enough for a touchline, credible enough for a tournament control room, and legible under pressure. The UI is not a dashboard, chat app, or AI playground. It is one focused relay path:

**Join room → compose structured alert → translate locally → inspect both languages → publish to peers.**

The product proof is the interface itself. Local translation and direct peer delivery should be visible as real system states, not promoted through decorative claims.

### Experience principles

1. **Operational, not theatrical.** Use direct labels, crisp hierarchy, and explicit system feedback.
2. **One task owns the canvas.** The active alert remains the largest object in the window.
3. **Bilingual content is the product visual.** Original and translated messages receive more space than controls or decoration.
4. **Trust comes from evidence.** Show model, room, peer count, timestamps, and delivery state where they are useful.
5. **Sparse does not mean empty.** Use alignment, type, rules, and deliberate negative space rather than filler cards.
6. **Honest network language.** Say “direct P2P” or “serverless relay”; never imply guaranteed offline discovery.

### Explicitly avoid

- gradients, glassmorphism, glows, neon green, and cyber/Web3 styling;
- a grid of generic rounded cards;
- fake charts, activity graphs, counters, or fabricated delivery success;
- oversized “AI” branding, sparkle icons, bot avatars, or magic-language copy;
- chat bubbles or social-feed conventions;
- pill badges for every label;
- football clichés such as grass textures, trophy imagery, or a luminous pitch-green palette;
- decorative copy that competes with the alert itself.

---

## 2. Brand direction

### Character

**Precise / composed / matchday / private / direct**

The visual tension should come from warm matchday urgency against a near-black editorial surface. The interface is predominantly monochrome; one warm orange-red accent marks the active relay path and primary action.

### Custom SVG mark: “Crossing the line”

Build a bespoke mark from a pitch boundary, a message node, and two relay strokes. It must read as a product metaphor before it reads as a letterform.

- A vertical line at `x=8` is the touchline.
- A short perpendicular line at the bottom grounds it as a pitch marking.
- A solid node centered on the touchline represents the original announcement.
- Two short horizontal strokes continue to the right at staggered heights, representing the message relayed beyond the boundary.
- Keep all geometry orthogonal except the circular node. Do not add radio-wave arcs or a generic Wi-Fi glyph.
- At 16–24 px, use one color and `round` line caps. At larger sizes, the relay strokes may use the accent while the pitch line remains off-white.

Reference construction (`24 × 24` viewBox):

```svg
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M7 3V20H13" stroke="currentColor" stroke-width="1.75"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="7" cy="11" r="2.25" fill="currentColor"/>
  <path d="M10.5 8.25H16.5M10.5 13.75H20"
        stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
</svg>
```

The mark may pair with the wordmark **Touchline Relay** in Geist Sans/Inter, 600 weight, `-0.02em` tracking. Never place it inside a generic rounded square. Use it in the titlebar, empty history state, and app icon. For the app icon, place the geometry directly on a square `#111416` field with generous 22% clear space; no gradient or faux depth.

---

## 3. Token system

### Color

```css
/* Surfaces */
--canvas:         #0B0D0E;  /* full window */
--surface-1:      #111416;  /* working planes */
--surface-2:      #171A1D;  /* hover, selected row, input inset */
--surface-3:      #202428;  /* pressed controls only */

/* Typography */
--ink:            #F4F2ED;  /* primary, slightly warm */
--ink-secondary:  #C1C4C2;
--muted:          #858B89;
--faint:          #5E6462;

/* Structure */
--line:           rgba(244, 242, 237, 0.10);
--line-strong:    rgba(244, 242, 237, 0.18);
--focus:          #FF714A;

/* One product accent */
--relay:          #FF714A;
--relay-hover:    #FF8565;
--relay-pressed:  #E65F3C;
--relay-ink:      #160B07;

/* Semantic signals — use only with text/icon, never as decoration */
--ready:          #63B88A;
--warning:        #D8A84E;
--danger:         #E16B62;
--inactive:       #717775;
```

Rules:

- Accent coverage should remain below roughly 5% of the visible window.
- Do not tint entire panels by status. A 6 px dot, 1 px rule, or icon plus text is enough.
- White text must never sit directly on `--relay`; use `--relay-ink`.
- Selected history items use `--surface-2` plus a 2 px accent edge, not an accent fill.

### Typography

Bundle fonts locally so the app has no network dependency.

- **UI/display:** Geist Sans, fallback `Inter, system-ui, sans-serif`.
- **Technical metadata:** Geist Mono, fallback `ui-monospace, SFMono-Regular, monospace`.
- Display title: 28/32, 600, `-0.035em`.
- Pane title: 18/24, 600, `-0.02em`.
- Alert body: 17/26, 450; translated preview may use 18/28.
- Standard UI: 13/19, 450–550.
- Field label: 11/16, 600, `0.08em`, uppercase.
- Metadata/technical values: 11/16 mono, tabular numerals.
- Avoid more than three simultaneous type sizes within one pane.

### Spacing and shape

- Base spacing unit: 4 px.
- Main gutters: 24 px; compact gutters: 16 px.
- Common spacing: 8 / 12 / 16 / 24 / 32 / 48.
- Control height: 38 px; primary action: 42 px; compact status item: 28 px.
- Radius: 5 px controls, 8 px large bounded plane, 999 px only for the two health indicators.
- Use 1 px borders; no drop shadows on ordinary panels.
- A single restrained elevation shadow is allowed for the technical drawer: `0 20px 60px rgba(0,0,0,.45)`.

### Icons

Use a consistent 16 px, 1.5 px stroke icon set. Prefer literal symbols: room key, language, peer, history, chevron, copy, retry. Do not use emoji. The custom mark is the only logo-like icon.

---

## 4. Core desktop composition

### Window frame

Target composition: `1280 × 800`. Minimum supported window: `760 × 620`. The app uses the OS-native frame unless a custom Electron titlebar is already required; do not sacrifice platform behavior for decoration.

#### Top bar — 56 px

A quiet persistent strip separated by one hairline rule:

- **Left:** mark + “Touchline Relay”.
- **Center/left:** current room name, only after joining; display as plain text with a key icon, not a badge.
- **Right:** exactly two compact health indicators:
  - `Local translation · Ready`
  - `P2P relay · 2 peers`
- **Far right:** `Proof` text button opens the technical drawer.

Health indicators may be small rounded capsules because they represent persistent system state. Keep them visually subdued: transparent background, hairline border, 6 px semantic dot. Clicking one reveals its concise detail popover.

### Main frame — three regions

At `≥1180 px`, use a fixed/fluid/fixed grid:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Brand / Room                       Local translation · P2P / Proof   │ 56
├───────────────┬───────────────────────────────────┬──────────────────┤
│ ROOM          │ NEW ALERT                         │ ANNOUNCEMENTS    │
│ 220–240 px    │ fluid, min 520 px                 │ 320–360 px       │
│               │                                   │                  │
│ room controls │ structured fields                 │ received/sent    │
│ room facts    │ message editor                    │ chronological    │
│               │                                   │ rows             │
│ privacy note  │ bilingual preview / publish       │                  │
└───────────────┴───────────────────────────────────┴──────────────────┘
```

Use vertical rules between regions rather than three floating cards. Each region gets one top label and its own scroll area. The composer is the dominant central plane.

### Left region: room rail

Before join:

- Eyebrow: `ROOM`.
- Title: `Join the matchday channel`.
- One room-key/name input.
- Full-width secondary button: `Join room`.
- One two-line note: “Peers connect directly over the network. Discovery requires network reachability.”

After join:

- Room name and truncated room key in mono.
- Peer count with a literal connected/disconnected label.
- `Copy room key` and `Leave` as quiet text actions.
- Thin divider, then privacy proof:
  - `Application server` → `None`
  - `Message history` → `This device`

Do not present these facts as four separate cards.

### Center region: composer and preview

Header row:

- `NEW ALERT` eyebrow.
- “Compose matchday update” title.
- Optional draft status on the right (`Not translated`, `Preview ready`), rendered as subdued text.

Structured controls share one 3-column row:

1. **Venue** — select/tag, e.g. `Pitch 2`.
2. **Priority** — `Routine`, `Important`, `Urgent`; use a segmented text control or select. Color appears only after selection and never replaces the text label.
3. **Translate to** — fixed/selected `Spanish · ES` for MVP.

Message field:

- A large, borderless/inset writing area, minimum 156 px high.
- Placeholder: `Write a short operational update…`
- Character count aligned bottom-right in mono.
- Supporting copy only when needed: “Venue names remain as structured tags.”

Primary first-stage action:

- `Translate locally` with a small language icon.
- Disabled until room, required fields, valid body, and model readiness conditions are met; expose the exact reason nearby rather than relying on a disabled appearance.
- During inference: `Translating on this device…` with a restrained inline progress line if real progress is available. Never fake percentage progress.

Bilingual preview appears in the same center region after successful translation. It should not open a modal.

- A horizontal rule and `PREVIEW` header introduce the result.
- Split original and translation into two equal columns at wide sizes.
- Each language has a small label (`ENGLISH · ORIGINAL`, `SPANISH · LOCAL TRANSLATION`) and large selectable body text.
- A slim metadata line below: model name, translation duration when measured, and `No cloud API` only if this is verified by architecture.
- Actions align bottom-right: quiet `Edit` and primary `Publish to room`.
- Publishing is always a distinct user action; translation must never auto-publish.

The ideal demo moment is the preview transition: the translated column resolves into place and the publish action becomes available, while the top health indicator remains truthful.

### Right region: announcement history

Header:

- `ANNOUNCEMENTS` eyebrow.
- Plain count on the right, e.g. `4`.

Rows are document-like, not chat bubbles:

- top line: venue, priority, and relative/absolute time;
- original message, clamped to two lines;
- translated message, clamped to two lines and slightly muted;
- footer: `Sent by this device` or `Received · peer …7F2A`, plus delivery state if known.

Use a 1 px separator between rows. Clicking a row selects it and expands its complete bilingual content in place or in the center detail view. Never imply read receipts unless the protocol actually provides them.

Empty state:

- Small monochrome custom mark.
- “No announcements yet.”
- “Published and received alerts will stay on this device.”
- No illustration, confetti, or large CTA.

---

## 5. Responsive and window behavior

This is a desktop app, not a mobile page. Optimize window states deliberately.

### Wide: `≥1440 px`

- Room rail 240 px; history 360 px; composer receives all remaining space.
- Preview remains side-by-side.
- Cap message line length near 68 characters within each language column.

### Standard: `1180–1439 px`

- Room rail 220 px; history 320 px; 20–24 px central gutters.
- Preview stays side-by-side if each language column remains at least 240 px.

### Compact: `900–1179 px`

- Collapse the room rail into a 52 px icon rail after joining; clicking opens an anchored 280 px room sheet.
- Keep center composer fluid and history at 300 px.
- Stack original above translation when the center pane falls below 560 px.
- Before joining, the room sheet opens by default so the entry task is never hidden.

### Minimum: `760–899 px`

- Center composer fills the canvas.
- History becomes a right-side drawer opened by `History (n)` in the top bar.
- Room uses the compact sheet.
- Structured controls wrap to two rows; message and CTA remain visible without horizontal scrolling.
- Technical proof remains a separate right-side drawer, never stacked over the history drawer.

### Height behavior

- Below 700 px, reduce vertical gutters from 24 to 16 px and editor minimum height from 156 to 112 px.
- Top bar remains fixed. Each major region scrolls independently.
- The primary action should not be permanently sticky; a subtle sticky action footer is acceptable only below 660 px height.
- Preserve keyboard focus and scroll position when drawers open or the window resizes.

---

## 6. Interaction and motion

Motion is quiet and functional.

- Hover transitions: 120 ms; pane/drawer transitions: 180–220 ms; `ease-out`.
- Translation preview: opacity `0 → 1` and `translateY(4px) → 0` over 180 ms. No typewriter effect.
- New received announcement: a 2 px accent edge appears for 800 ms, then settles to the standard separator. Do not pulse indefinitely.
- Connected peer changes may cross-fade the numeral; avoid celebratory animation.
- Primary button press uses a 1 px downward translation only.
- Respect `prefers-reduced-motion: reduce`: remove transforms, animated progress, and auto-scrolling; preserve immediate state changes.

Keyboard:

- Logical tab order follows room → structured fields → message → translate → preview → publish → history.
- `Ctrl/Cmd + Enter` translates when editing and publishes only while preview has explicit focus; never overload the same shortcut ambiguously.
- `Escape` closes popovers/drawers and returns focus to their trigger.
- Visible 2 px `--focus` outline with 2 px offset on every interactive control.

---

## 7. Required state design and copy

### Local translation

| State | Indicator | Center-pane behavior |
|---|---|---|
| Unloaded | `Local translation · Not loaded` | Translate disabled; action `Load model` if loading is user-triggered |
| Loading | `Local translation · Loading model` | Real stage/progress only; keep composer editable |
| Ready | `Local translation · Ready` | Translate enabled when form is valid |
| Translating | `Local translation · Translating` | Inputs remain readable; prevent duplicate request |
| Error | `Local translation · Needs attention` | Inline plain-language error + `Retry`; technical detail stays in Proof drawer |
| Unavailable | `Local translation · Unavailable` | State clearly that publishing cannot create a new translation; do not fabricate fallback output |

### P2P room

| State | Indicator | Room behavior |
|---|---|---|
| Not joined | `P2P relay · Not joined` | Join form visible |
| Joining | `P2P relay · Joining` | Disable duplicate join; show cancellable state if supported |
| Joined, no peers | `P2P relay · Joined · 0 peers` | Publish may be allowed if protocol queues/broadcasts honestly; state “Waiting for peers” |
| Joined with peers | `P2P relay · n peers` | Normal publish flow |
| Reconnecting | `P2P relay · Reconnecting` | Preserve draft; do not claim delivery |
| Error | `P2P relay · Needs attention` | Concise error + retry/leave action |

### Composer validation

- Missing venue: `Choose a venue.`
- Empty body: `Write an announcement before translating.`
- Too long: state actual limit and remaining excess.
- Translation stale after editing original: mark preview `Out of date`, disable publish, and require retranslation.
- Duplicate publish click: lock action immediately and preserve one request ID.

### Publish lifecycle

1. **Ready:** `Publish to room`.
2. **Sending:** `Publishing…`; retain preview and prevent editing until outcome.
3. **Accepted by local relay:** `Published to room` with timestamp. This does **not** mean every peer received it.
4. **Received by peer, if protocol confirms:** represent only the evidence actually available.
5. **Failed:** preserve draft and preview; show `Couldn’t publish` with `Try again`.

Never use “Delivered to everyone” without protocol-level acknowledgement from every intended recipient.

### Technical proof drawer

A 420 px right-side drawer intended for judges and troubleshooting, not primary workflow. Sections use dense rows and mono values:

- **Local translation:** SDK/model identifier, lifecycle state, last measured duration, no API key configured.
- **P2P runtime:** Pear worker state, truncated discovery/room key, local peer ID, connected peer count.
- **Last announcement:** message ID, created timestamp, schema/protocol version, publish state.
- **Privacy note:** “Translation runs on this device. Messages travel directly between reachable peers; peer discovery requires network access.”

Provide copy buttons for non-secret IDs. Never display full secrets or imply cryptographic guarantees not implemented.

---

## 8. Accessibility and content quality

- Meet WCAG AA contrast for text and interactive controls; target 4.5:1 for standard text.
- Do not encode priority, connection, or error state by color alone.
- Minimum pointer target 36 × 36 px; primary controls 42 px high.
- Associate every label and error with its input. Announce translation and publish outcomes through a polite live region; errors use assertive only when blocking.
- Preserve text selection and copying in both language previews and history.
- Use `lang="en"` and `lang="es"` on the respective message bodies for screen readers.
- Display timestamps in local time with full timestamp available on hover/focus.
- Truncate peer/message IDs in UI but expose the full value through copy and accessible text.

Tone is concise, factual, and calm:

- Prefer `Translate locally` over `Generate with AI`.
- Prefer `Publish to room` over `Blast alert`.
- Prefer `Waiting for peers` over `Nobody is online!`.
- Prefer `Direct P2P` over `Fully offline`.
- Prefer `No application server` over `Decentralized revolution`.

---

## 9. Visual QA checklist

### Composition

- [ ] At 1280 × 800, the composer is visually dominant and the bilingual preview is the primary product visual.
- [ ] The canvas reads as three aligned regions, not a collection of floating cards.
- [ ] There are no gradients, glowing edges, fake charts, glass panels, or decorative blobs.
- [ ] Accent color occupies only actions, focus, selection, and momentary relay emphasis.
- [ ] The mark is the custom touchline/node/relay geometry, not a letter in a rounded square.
- [ ] Long message text remains comfortably readable and does not collide with actions.

### Window sizes

- [ ] Wide, standard, compact, minimum-width, and low-height layouts are captured and reviewed.
- [ ] No horizontal scrollbar appears at 760 × 620.
- [ ] Room, history, and proof drawers are mutually exclusive at narrow widths.
- [ ] Resizing does not discard draft, preview, selected history row, focus, or scroll position.
- [ ] Side-by-side preview stacks before either language column becomes cramped.

### States

- [ ] Every local-model state is visually distinct and text-labeled.
- [ ] Every room state is visually distinct and text-labeled.
- [ ] `0 peers` is not styled as success and does not claim delivery.
- [ ] Editing after translation visibly invalidates the preview and blocks publish.
- [ ] Publish success means local relay acceptance only unless stronger evidence exists.
- [ ] Model, network, validation, and publish errors preserve the user’s draft.
- [ ] Demo fixture mode is visibly identified and never reuses real-success copy or status color.

### Interaction

- [ ] Full workflow is possible by keyboard with a visible focus ring.
- [ ] Drawer close returns focus to its trigger.
- [ ] Loading controls prevent duplicate requests without freezing unrelated reading/editing.
- [ ] Reduced-motion mode contains no transform animation, pulsing, or forced smooth scroll.
- [ ] New-announcement emphasis settles and does not become ambient animation.

### Accessibility and polish

- [ ] Text and controls pass AA contrast checks on every surface/state.
- [ ] Priority and health states include text/icon cues in addition to color.
- [ ] English and Spanish bodies carry correct language attributes.
- [ ] At 200% zoom, controls remain operable and content does not overlap.
- [ ] Empty, loading, error, and populated states all use the same grid and spacing rhythm.
- [ ] Real long venue names, maximum-length alerts, long Spanish translations, and double-digit peer counts are tested.
- [ ] Copy is truthful about local translation, direct P2P transport, and network-dependent discovery.

---

## 10. Definition of visually complete

The UI is ready when a new viewer can understand the whole product from one standard-width screenshot: a joined room and truthful health states frame a single structured English alert, its locally produced Spanish translation, a deliberate publish action, and a sparse history of direct peer announcements. Nothing decorative should be needed to explain what the product does.
