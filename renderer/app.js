;(() => {
  const apiBridge = window.bridge
  const { createInitialState, reduceState } = window.TouchlineState

  const worker = '/workers/main.js'
  const encoder = new TextEncoder()
  const decoder = new TextDecoder('utf-8')
  let state = createInitialState()
  let translatedBody = ''
  let originalBody = ''
  let publishing = false
  let selectedHistoryId = ''
  let pendingAnnouncement = null
  let activeDrawer = ''
  let lastDrawerTrigger = null

  const els = {
    room: document.querySelector('#room'),
    join: document.querySelector('#join'),
    venue: document.querySelector('#venue'),
    priority: document.querySelector('#priority'),
    language: document.querySelector('#language'),
    body: document.querySelector('#body'),
    translate: document.querySelector('#translate'),
    publish: document.querySelector('#publish'),
    edit: document.querySelector('#edit'),
    originalPreview: document.querySelector('#original-preview'),
    translatedPreview: document.querySelector('#translated-preview'),
    preview: document.querySelector('#preview'),
    sampleFlag: document.querySelector('#sample-flag'),
    translationMeta: document.querySelector('#translation-meta'),
    draftStatus: document.querySelector('#draft-status'),
    characterCount: document.querySelector('#character-count'),
    publishNote: document.querySelector('#publish-note'),
    history: document.querySelector('#history'),
    emptyHistory: document.querySelector('#empty-history'),
    historyCount: document.querySelector('#history-count'),
    historyCountTop: document.querySelector('#history-count-top'),
    historyRegion: document.querySelector('#history-region'),
    historyToggle: document.querySelector('#history-toggle'),
    roomRail: document.querySelector('#room-rail'),
    roomToggle: document.querySelector('#room-toggle'),
    topRoom: document.querySelector('#top-room'),
    joinedRoomName: document.querySelector('#joined-room-name'),
    roomKey: document.querySelector('#room-key'),
    copyRoom: document.querySelector('#copy-room'),
    leaveRoom: document.querySelector('#leave-room'),
    connectionLabel: document.querySelector('#connection-label'),
    p2pStatus: document.querySelector('#p2p-status'),
    relayHealth: document.querySelector('#relay-health'),
    relayDot: document.querySelector('#relay-dot'),
    qvacStatus: document.querySelector('#qvac-status'),
    translationHealth: document.querySelector('#translation-health'),
    translationDot: document.querySelector('#translation-dot'),
    peerCount: document.querySelector('#peer-count'),
    error: document.querySelector('#error'),
    proof: document.querySelector('#proof-log'),
    proofDrawer: document.querySelector('#proof-drawer'),
    proofToggle: document.querySelector('#proof-toggle'),
    proofClose: document.querySelector('#proof-close'),
    proofTranslationState: document.querySelector('#proof-translation-state'),
    proofRoom: document.querySelector('#proof-room'),
    proofPeers: document.querySelector('#proof-peers'),
    backdrop: document.querySelector('#drawer-backdrop'),
    fixture: document.querySelector('#fixture')
  }

  const demoMode = new URLSearchParams(location.search).has('demo')
  const hasBridge = Boolean(apiBridge && typeof apiBridge.startWorker === 'function')

  document.querySelectorAll('.segment-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.segment-btn').forEach((other) => {
        const active = other === btn
        other.classList.toggle('is-active', active)
        other.setAttribute('aria-checked', active ? 'true' : 'false')
      })
      els.priority.value = btn.dataset.priority
    })
  })

  if (hasBridge) {
    apiBridge.startWorker(worker)

    apiBridge.onWorkerIPC(worker, (data) => {
      const message = JSON.parse(decoder.decode(data))
      const identity =
        message.type === 'joined' || message.type === 'status'
          ? ` · topic ${truncateId(message.topic || 'pending', 16)} · peer ${truncateId(message.peerId || 'pending', 16)}`
          : ''
      appendProof(`worker -> ${message.type}${identity}`)

      if (message.type === 'joined') {
        state = reduceState(state, {
          type: 'room/joined',
          room: message.room,
          peers: message.peers
        })
      } else if (message.type === 'left') {
        state = reduceState(state, { type: 'room/left' })
      } else if (message.type === 'status' || message.type === 'peer') {
        state = reduceState(state, {
          type: 'room/status',
          status: message.status,
          peers: message.peers
        })
      } else if (message.type === 'announcement') {
        const announcement = { ...message.announcement, localSource: 'peer', ackCount: 0 }
        state = reduceState(state, { type: 'announcement/received', announcement })
      } else if (message.type === 'ack') {
        state = reduceState(state, {
          type: 'announcement/ack',
          announcementId: message.announcementId,
          peerId: message.peerId
        })
      } else if (message.type === 'published') {
        if (pendingAnnouncement && pendingAnnouncement.id === message.id) {
          state = reduceState(state, {
            type: 'announcement/received',
            announcement: { ...pendingAnnouncement, localSource: 'this-device', ackCount: 0 }
          })
        }
        state = reduceState(state, { type: 'composer/published', id: message.id })
        pendingAnnouncement = null
        publishing = false
        els.publishNote.textContent = `Accepted by the local relay at ${new Date().toLocaleTimeString()}. Peer receipts arrive as ACKs from connected peers.`
      } else if (message.type === 'error') {
        publishing = false
        state = reduceState(state, { type: 'error', message: message.message })
      }

      render()
    })

    apiBridge.onWorkerStderr(worker, (data) =>
      appendProof(`worker stderr -> ${decoder.decode(data).trim()}`)
    )
    apiBridge.onTranslationProgress((event) => {
      state = reduceState(state, { type: 'composer/translating' })
      const loaded = event.progress && event.progress.loaded
      const total = event.progress && event.progress.total
      appendProof(`qvac progress -> ${loaded || '?'} / ${total || '?'}`)
      render()
    })
  }

  if (demoMode) seedDemoState()

  els.join.addEventListener('click', async () => {
    const requestedRoom = els.room.value.trim()
    if (!requestedRoom) return showError('Enter a room label.')
    state = reduceState(state, { type: 'room/joining', room: requestedRoom })
    render()
    try {
      await sendWorker({ type: 'join', room: requestedRoom })
      appendProof(`renderer -> requested join ${requestedRoom}`)
    } catch (err) {
      showError(`Could not request room join: ${err.message}`)
    }
  })

  els.body.addEventListener('input', () => {
    state = reduceState(state, { type: 'composer/edited', original: els.body.value.trim() })
    render()
  })

  els.translate.addEventListener('click', async () => {
    originalBody = els.body.value.trim()
    translatedBody = ''
    if (!state.room) return showError('Join a room before translating.')
    if (!els.venue.value) return showError('Choose a venue.')
    if (!originalBody) return showError('Write an announcement before translating.')
    const targetLanguage = els.language.value || 'es'
    if (!['es', 'fr', 'de', 'pt'].includes(targetLanguage)) {
      return showError('Supported targets: Spanish, French, German, Portuguese.')
    }

    state = reduceState(state, { type: 'composer/translating' })
    render()

    const started = performance.now()
    try {
      if (!hasBridge) throw new Error('Bridge unavailable in demo preview')
      const result = apiBridge.translate
        ? await apiBridge.translate(originalBody, targetLanguage)
        : await apiBridge.translateToSpanish(originalBody)
      translatedBody = result.text
      const lang = result.targetLanguage || targetLanguage
      state = reduceState(state, {
        type: 'composer/translated',
        original: originalBody,
        translated: translatedBody,
        targetLanguage: lang
      })
      const modelTag = `BERGAMOT_EN_${String(lang).toUpperCase()}`
      els.translationMeta.textContent = `${modelTag} · ${Math.round(performance.now() - started)} ms · No cloud API`
      appendProof(`qvac -> translated locally with ${modelTag}`)
    } catch (err) {
      showError(`Local translation needs attention: ${err.message}`)
    }
    render()
  })

  els.publish.addEventListener('click', async () => {
    if (!state.preview || state.preview.status !== 'ready' || !translatedBody) {
      return showError('Retranslate the current announcement before publishing.')
    }
    if (!state.room) return showError('Join a room before publishing.')
    if (publishing) return

    publishing = true
    render()
    try {
      const targetLanguage =
        (state.preview && state.preview.targetLanguage) || els.language.value || 'es'
      const announcement = await makeAnnouncement({
        room: state.room,
        venue: els.venue.value,
        priority: els.priority.value,
        body: originalBody,
        translatedBody,
        targetLanguage
      })
      pendingAnnouncement = announcement
      await sendWorker({ type: 'publish', announcement })
      appendProof(`renderer -> publish request ${announcement.id.slice(0, 12)}`)
    } catch (err) {
      publishing = false
      pendingAnnouncement = null
      showError(`Couldn’t publish: ${err.message}`)
    }
    render()
  })

  els.fixture.addEventListener('click', async () => {
    const fixture = await makeAnnouncement({
      room: 'local-visual-sample',
      venue: 'North Touchline',
      priority: 'important',
      body: 'Fixture mode shows a local visual sample only.',
      translatedBody: 'El modo de muestra solo presenta una vista visual local.'
    })
    state = reduceState(state, { type: 'fixture/shown', announcement: fixture })
    appendProof('fixture -> local visual sample; real QVAC and P2P health unchanged')
    render()
  })

  els.edit.addEventListener('click', () => {
    els.body.focus()
    els.body.setSelectionRange(els.body.value.length, els.body.value.length)
  })

  els.copyRoom.addEventListener('click', async () => {
    if (!state.room) return
    await navigator.clipboard.writeText(state.room)
    els.copyRoom.textContent = 'Copied'
    window.setTimeout(() => {
      els.copyRoom.textContent = 'Copy key'
    }, 1200)
  })

  if (els.leaveRoom) {
    els.leaveRoom.addEventListener('click', async () => {
      if (!state.room && state.p2pStatus !== 'joining') return
      try {
        await sendWorker({ type: 'leave' })
        appendProof('renderer -> requested leave')
      } catch (err) {
        showError(`Could not leave room: ${err.message}`)
      }
    })
  }

  els.proofToggle.addEventListener('click', () => openDrawer('proof', els.proofToggle))
  els.proofClose.addEventListener('click', closeDrawers)
  els.historyToggle.addEventListener('click', () => openDrawer('history', els.historyToggle))
  els.roomToggle.addEventListener('click', () => {
    const defaultSheetOpen =
      !document.body.classList.contains('room-joined') &&
      !document.body.classList.contains('room-sheet-dismissed') &&
      window.matchMedia('(max-width: 899px)').matches
    if (activeDrawer === 'room' || defaultSheetOpen) closeDrawers()
    else openDrawer('room', els.roomToggle)
  })
  els.backdrop.addEventListener('click', closeDrawers)
  els.translationHealth.addEventListener('click', () => openDrawer('proof', els.translationHealth))
  els.relayHealth.addEventListener('click', () => openDrawer('proof', els.relayHealth))

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeDrawer) closeDrawers()
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      if (document.activeElement === els.publish && !els.publish.disabled) els.publish.click()
      else if (!els.translate.disabled) els.translate.click()
    }
  })

  function openDrawer(name, trigger) {
    closeDrawers(false)
    document.body.classList.remove('room-sheet-dismissed')
    activeDrawer = name
    lastDrawerTrigger = trigger
    els.backdrop.classList.add('open')
    if (name === 'proof') {
      els.proofDrawer.classList.add('open')
      els.proofDrawer.setAttribute('aria-hidden', 'false')
      els.proofClose.focus()
    } else if (name === 'history') {
      els.historyRegion.classList.add('open')
    } else if (name === 'room') {
      els.roomRail.classList.add('open')
      els.room.focus()
    }
  }

  function closeDrawers(returnFocus = true) {
    const defaultRoomSheetWasOpen =
      !document.body.classList.contains('room-joined') &&
      !document.body.classList.contains('room-sheet-dismissed') &&
      window.matchMedia('(max-width: 899px)').matches
    els.proofDrawer.classList.remove('open')
    els.proofDrawer.setAttribute('aria-hidden', 'true')
    els.historyRegion.classList.remove('open')
    els.roomRail.classList.remove('open')
    els.backdrop.classList.remove('open')
    if (activeDrawer === 'room' || defaultRoomSheetWasOpen) {
      document.body.classList.add('room-sheet-dismissed')
    }
    const trigger = lastDrawerTrigger
    activeDrawer = ''
    lastDrawerTrigger = null
    if (returnFocus && trigger) trigger.focus()
  }

  function render() {
    const joined = Boolean(state.room)
    const joining = state.p2pStatus === 'joining'
    const previewReady = state.preview && state.preview.status === 'ready'
    const previewStale = state.preview && state.preview.status === 'stale'
    const previewPublished = state.preview && state.preview.status === 'published'
    const bodyLength = els.body.value.length
    const realAndFixtureHistory = [...state.fixtureHistory, ...state.history]

    document.body.classList.toggle('room-joined', joined)
    if (els.leaveRoom) els.leaveRoom.disabled = !joined && !joining
    els.join.disabled = joining
    els.join.textContent = joining ? 'Joining…' : 'Join room'
    els.topRoom.textContent = joined
      ? state.room
      : joining
        ? `Joining ${state.pendingRoom}`
        : 'No room joined'
    els.joinedRoomName.textContent = state.room || '—'
    els.roomKey.textContent = state.room
      ? `room label · ${truncateId(state.room, 22)}`
      : 'room label · —'
    els.connectionLabel.textContent = joined
      ? 'Connected to room'
      : joining
        ? 'Joining'
        : 'Not joined'

    const relayLabel = joining
      ? 'Joining'
      : joined
        ? state.peerCount > 0
          ? `${state.peerCount} peer${state.peerCount === 1 ? '' : 's'}`
          : 'Joined · 0 peers'
        : 'Not joined'
    els.p2pStatus.textContent = relayLabel
    els.relayHealth.title = `P2P relay · ${relayLabel}`
    els.peerCount.textContent = `${state.peerCount} · ${state.peerCount > 0 ? 'connected' : 'waiting'}`
    els.relayDot.className = `status-dot ${state.peerCount > 0 ? 'ready' : joined || joining ? 'warning' : ''}`

    const translationLabel =
      state.translationStatus === 'loading'
        ? 'Loading model'
        : state.translationStatus === 'ready'
          ? 'Ready'
          : 'Not loaded'
    els.qvacStatus.textContent = translationLabel
    els.translationHealth.title = `Local translation · ${translationLabel}`
    els.translationDot.className = `status-dot ${state.translationStatus === 'ready' ? 'ready' : state.translationStatus === 'loading' ? 'warning' : ''}`

    els.characterCount.textContent = `${bodyLength} / 420`
    els.translate.disabled =
      !joined || joining || !els.body.value.trim() || state.translationStatus === 'loading'
    els.translate.textContent =
      state.translationStatus === 'loading' ? 'Translating on this device…' : 'Translate locally'
    els.publish.disabled = !previewReady || publishing
    els.publish.textContent = publishing
      ? 'Publishing…'
      : previewPublished
        ? 'Published'
        : 'Publish to room'
    els.draftStatus.textContent = previewStale
      ? 'Preview out of date'
      : previewPublished
        ? 'Published to local relay'
        : previewReady
          ? 'Preview ready'
          : state.translationStatus === 'loading'
            ? 'Translating'
            : 'Not translated'

    els.preview.classList.toggle('stale', Boolean(previewStale))
    els.preview.classList.toggle('ready', Boolean(previewReady))
    els.sampleFlag.hidden = Boolean(state.preview)
    if (state.preview) {
      els.originalPreview.textContent = state.preview.original
      els.translatedPreview.textContent = state.preview.translated
    } else {
      els.originalPreview.textContent = 'Translate an announcement to preview the original here.'
      els.translatedPreview.textContent = 'Local Spanish translation will appear here.'
      els.translationMeta.textContent = 'No local translation yet'
    }

    if (state.error) {
      els.error.textContent = state.error
      els.error.classList.add('error')
    } else if (!joined) {
      els.error.textContent = joining
        ? 'Waiting for the P2P worker to confirm the room.'
        : 'Join a room to translate and publish.'
      els.error.classList.remove('error')
    } else if (!els.body.value.trim()) {
      els.error.textContent = 'Write an announcement before translating.'
      els.error.classList.remove('error')
    } else if (previewStale) {
      els.error.textContent = 'The original changed. Translate again before publishing.'
      els.error.classList.remove('error')
    } else {
      els.error.textContent = state.peerCount
        ? 'Ready for local translation and direct relay.'
        : 'Room joined. Waiting for peers; discovery requires network reachability.'
      els.error.classList.remove('error')
    }

    els.historyCount.textContent = String(realAndFixtureHistory.length)
    els.historyCountTop.textContent = String(realAndFixtureHistory.length)
    els.emptyHistory.hidden = realAndFixtureHistory.length > 0
    els.history.replaceChildren(...realAndFixtureHistory.map(renderHistoryItem))

    els.proofTranslationState.textContent = translationLabel.toLowerCase()
    els.proofRoom.textContent = state.room || state.pendingRoom || 'not joined'
    els.proofPeers.textContent = String(state.peerCount)
  }

  function renderHistoryItem(announcement) {
    const sample = state.fixtureHistory.some((item) => item.id === announcement.id)
    const expanded = selectedHistoryId === announcement.id
    const priority = String(announcement.priority || 'routine')
    const item = document.createElement('li')
    item.className = `history-item${sample ? ' sample' : ''}${expanded ? ' selected is-expanded' : ''}`
    item.tabIndex = 0
    item.setAttribute(
      'aria-label',
      `${sample ? 'Local visual sample' : 'Announcement'} at ${announcement.venue}`
    )
    const created = announcement.createdAt ? new Date(announcement.createdAt) : new Date()
    const ackCount = announcement.ackCount || (state.acks[announcement.id] || []).length
    const footer = sample
      ? 'Local sample · no relay activity'
      : announcement.localSource === 'this-device'
        ? `Sent by this device · local relay accepted · ${ackCount} peer receipt${ackCount === 1 ? '' : 's'}`
        : `Received · ${escapeHtml(truncateId(announcement.id, 10))}`
    const translations = announcement.translations || {}
    const translatedLang = Object.keys(translations)[0] || 'es'
    const es = translations[translatedLang] || ''
    item.innerHTML = `
    <div class="history-meta">
      <strong>${escapeHtml(announcement.venue)}</strong>
      <span class="priority-chip is-${escapeHtml(priority)}">${escapeHtml(priority)}</span>
      <time datetime="${escapeHtml(created.toISOString())}" title="${escapeHtml(created.toLocaleString())}">${escapeHtml(created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</time>
    </div>
    <p class="history-copy" lang="en">${escapeHtml(announcement.body)}</p>
    <p class="history-copy translated" lang="${escapeHtml(translatedLang)}">${escapeHtml(es)}</p>
    <div class="history-footer">${footer}</div>
  `
    const select = () => {
      selectedHistoryId = selectedHistoryId === announcement.id ? '' : announcement.id
      render()
    }
    item.addEventListener('click', select)
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        select()
      }
    })
    return item
  }

  function seedDemoState() {
    const now = Date.now()
    const a = {
      id: 'demo-sent-1',
      type: 'touchline.announcement.v1',
      room: 'saturday-final',
      venue: 'Pitch 2',
      priority: 'urgent',
      body: 'Kickoff moves to Pitch 2 at 14:30. Meet at the north gate.',
      translations: {
        es: 'Kickoff se traslada a Pitch 2 a las 14:30. Reúnase en la puerta norte.'
      },
      createdAt: new Date(now - 8 * 60000).toISOString(),
      localSource: 'this-device'
    }
    const b = {
      id: 'demo-recv-1',
      type: 'touchline.announcement.v1',
      room: 'saturday-final',
      venue: 'Main Gate',
      priority: 'important',
      body: 'Volunteer briefing at Main Gate in 10 minutes.',
      translations: { es: 'Reunión de voluntarios en la puerta principal en 10 minutos.' },
      createdAt: new Date(now - 3 * 60000).toISOString(),
      localSource: 'peer'
    }
    state = reduceState(state, { type: 'room/joined', room: 'saturday-final', peers: 2 })
    state = reduceState(state, {
      type: 'composer/translated',
      original: a.body,
      translated: a.translations.es
    })
    state = reduceState(state, { type: 'composer/published', id: a.id })
    state = reduceState(state, { type: 'announcement/received', announcement: a })
    state = reduceState(state, { type: 'announcement/received', announcement: b })
    state = { ...state, translationStatus: 'ready', peerCount: 2, p2pStatus: 'joined' }
    els.body.value = a.body
    els.venue.value = 'Pitch 2'
    els.priority.value = 'urgent'
    document.querySelectorAll('.segment-btn').forEach((btn) => {
      const active = btn.dataset.priority === 'urgent'
      btn.classList.toggle('is-active', active)
      btn.setAttribute('aria-checked', active ? 'true' : 'false')
    })
    els.translationMeta.textContent = 'BERGAMOT_EN_ES · demo preview · No cloud API'
    els.publishNote.textContent =
      'Demo preview: populated history + joined channel (not live network).'
    selectedHistoryId = a.id
  }

  async function sendWorker(command) {
    if (!hasBridge) throw new Error('Bridge unavailable in demo preview')
    await apiBridge.writeWorkerIPC(worker, encoder.encode(JSON.stringify(command)))
  }

  async function makeAnnouncement({
    room,
    venue,
    priority,
    body,
    translatedBody,
    targetLanguage = 'es'
  }) {
    const createdAt = new Date().toISOString()
    const lang = targetLanguage || 'es'
    const base = {
      type: 'touchline.announcement.v1',
      room,
      venue,
      priority,
      body,
      translations: { [lang]: translatedBody },
      createdAt
    }
    const id = await sha256(JSON.stringify(base))
    return { id, ...base, ackCount: 0 }
  }

  async function sha256(text) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text))
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  function showError(message) {
    state = reduceState(state, { type: 'error', message })
    render()
  }

  function appendProof(line) {
    const time = new Date().toLocaleTimeString()
    els.proof.textContent = `${time} ${line}\n${els.proof.textContent}`.slice(0, 4000)
  }

  function truncateId(value, length) {
    const text = String(value)
    return text.length > length
      ? `${text.slice(0, Math.max(4, length - 5))}…${text.slice(-4)}`
      : text
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    })
  }

  render()
})()
