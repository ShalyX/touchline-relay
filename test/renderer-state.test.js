const assert = require('node:assert/strict')
const test = require('node:test')

const { createInitialState, reduceState } = require('../renderer/state')

test('renderer state tracks join, translation preview, publish, and incoming history', () => {
  let state = createInitialState()

  state = reduceState(state, { type: 'room/joined', room: 'cup-final', peers: 1 })
  state = reduceState(state, {
    type: 'composer/translated',
    original: 'Warmups start in ten minutes.',
    translated: 'Los calentamientos empiezan en diez minutos.',
    targetLanguage: 'es'
  })
  state = reduceState(state, { type: 'composer/published', id: 'a1' })
  state = reduceState(state, {
    type: 'announcement/received',
    announcement: { id: 'a2', venue: 'Pitch 1', priority: 'routine' }
  })

  assert.equal(state.room, 'cup-final')
  assert.equal(state.peerCount, 1)
  assert.equal(state.preview.translated, 'Los calentamientos empiezan en diez minutos.')
  assert.equal(state.preview.status, 'published')
  assert.equal(state.lastPublishedId, 'a1')
  assert.deepEqual(
    state.history.map((item) => item.id),
    ['a2']
  )
})

test('renderer state does not duplicate received announcements', () => {
  let state = createInitialState()
  const announcement = { id: 'same', venue: 'Pitch 3', priority: 'important' }

  state = reduceState(state, { type: 'announcement/received', announcement })
  state = reduceState(state, { type: 'announcement/received', announcement })

  assert.equal(state.history.length, 1)
})

test('editing the original after translation marks the preview stale', () => {
  let state = createInitialState()
  state = reduceState(state, {
    type: 'composer/translated',
    original: 'Kickoff is at 14:30.',
    translated: 'El inicio es a las 14:30.'
  })

  state = reduceState(state, {
    type: 'composer/edited',
    original: 'Kickoff is at 15:00.'
  })

  assert.equal(state.preview.status, 'stale')
  assert.equal(state.preview.original, 'Kickoff is at 14:30.')
})

test('room is committed only after the worker confirms it joined', () => {
  let state = createInitialState()

  state = reduceState(state, { type: 'room/joining', room: 'cup-final' })
  assert.equal(state.room, '')
  assert.equal(state.pendingRoom, 'cup-final')
  assert.equal(state.p2pStatus, 'joining')

  state = reduceState(state, { type: 'room/joined', room: 'cup-final', peers: 0 })
  assert.equal(state.room, 'cup-final')
  assert.equal(state.pendingRoom, '')
  assert.equal(state.p2pStatus, 'joined')
})

test('leave clears room membership without clearing history', () => {
  let state = createInitialState()
  state = reduceState(state, { type: 'room/joined', room: 'cup-final', peers: 2 })
  state = reduceState(state, {
    type: 'announcement/received',
    announcement: { id: 'a1', venue: 'Pitch 1', priority: 'routine' }
  })
  state = reduceState(state, { type: 'room/left' })
  assert.equal(state.room, '')
  assert.equal(state.peerCount, 0)
  assert.equal(state.p2pStatus, 'idle')
  assert.equal(state.history.length, 1)
})

test('acks accumulate unique peer receipts for a published announcement', () => {
  let state = createInitialState()
  state = reduceState(state, {
    type: 'announcement/received',
    announcement: { id: 'a1', venue: 'Pitch 1', priority: 'urgent', localSource: 'this-device' }
  })
  state = reduceState(state, { type: 'announcement/ack', announcementId: 'a1', peerId: 'p1' })
  state = reduceState(state, { type: 'announcement/ack', announcementId: 'a1', peerId: 'p1' })
  state = reduceState(state, { type: 'announcement/ack', announcementId: 'a1', peerId: 'p2' })
  assert.deepEqual(state.acks.a1, ['p1', 'p2'])
  assert.equal(state.history[0].ackCount, 2)
})

test('fixture sample never changes real translation or relay health state', () => {
  const initial = createInitialState()
  const fixture = { id: 'fixture', venue: 'Pitch 2', priority: 'important' }

  const state = reduceState(initial, { type: 'fixture/shown', announcement: fixture })

  assert.equal(state.p2pStatus, initial.p2pStatus)
  assert.equal(state.translationStatus, initial.translationStatus)
  assert.deepEqual(state.fixtureHistory, [fixture])
  assert.deepEqual(state.history, [])
})
