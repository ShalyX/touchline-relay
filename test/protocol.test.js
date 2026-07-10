const assert = require('node:assert/strict')
const test = require('node:test')

const {
  createDuplicateFilter,
  deriveRoomKey,
  makeAnnouncement,
  parseWireMessage,
  serializeWireMessage,
  validateAnnouncement,
  validateAck
} = require('../lib/protocol')

test('deriveRoomKey returns a stable 32-byte topic without exposing the room label', () => {
  const topic = deriveRoomKey('Saturday Final / Pitch 2')

  assert.equal(Buffer.isBuffer(topic), true)
  assert.equal(topic.byteLength, 32)
  assert.deepEqual(topic, deriveRoomKey(' saturday final / pitch 2 '))
  assert.notEqual(topic.toString('hex'), Buffer.from('Saturday Final / Pitch 2').toString('hex'))
})

test('validateAnnouncement accepts the structured MVP announcement shape', () => {
  const announcement = makeAnnouncement({
    room: 'cup-final',
    venue: 'Pitch 2',
    priority: 'urgent',
    targetLanguage: 'es',
    body: 'Kickoff moves to 14:30.',
    translatedBody: 'El inicio se traslada a las 14:30.'
  })

  assert.equal(validateAnnouncement(announcement).ok, true)
  assert.equal(announcement.type, 'touchline.announcement.v1')
  assert.match(announcement.id, /^[a-f0-9]{64}$/)
  assert.equal(announcement.translations.es, 'El inicio se traslada a las 14:30.')
})

test('validateAnnouncement accepts French target language', () => {
  const announcement = makeAnnouncement({
    room: 'cup-final',
    venue: 'Pitch 2',
    priority: 'important',
    targetLanguage: 'fr',
    body: 'Kickoff moves to 14:30.',
    translatedBody: 'Le coup d’envoi passe à 14h30.'
  })
  assert.equal(validateAnnouncement(announcement).ok, true)
  assert.equal(announcement.translations.fr, 'Le coup d’envoi passe à 14h30.')
})

test('validateAnnouncement rejects invalid priority, language, and overlong body', () => {
  const invalid = makeAnnouncement({
    room: 'cup-final',
    venue: 'Pitch 2',
    priority: 'critical',
    targetLanguage: 'xx',
    body: 'x'.repeat(421),
    translatedBody: 'ignored'
  })

  const result = validateAnnouncement(invalid)

  assert.equal(result.ok, false)
  assert.deepEqual(result.errors.sort(), [
    'body must be 1-420 characters',
    'priority must be routine, important, or urgent',
    'translations must include a supported target language (es, fr, de, pt)'
  ])
})

test('wire serialization round-trips announcements and acks', () => {
  const announcement = makeAnnouncement({
    room: 'cup-final',
    venue: 'Pitch 2',
    priority: 'important',
    targetLanguage: 'es',
    body: 'Check in at the east gate.',
    translatedBody: 'Registrese en la puerta este.'
  })

  const wire = serializeWireMessage({ type: 'announcement', announcement })
  assert.equal(wire.endsWith('\n'), true)
  assert.deepEqual(parseWireMessage(wire), { type: 'announcement', announcement })

  const ack = {
    type: 'ack',
    announcementId: announcement.id,
    peerId: 'peer-abc'
  }
  const ackWire = serializeWireMessage(ack)
  assert.deepEqual(parseWireMessage(ackWire), ack)
  assert.equal(validateAck(ack).ok, true)

  assert.throws(() => parseWireMessage('{'), /Invalid JSON/)
  assert.throws(
    () => parseWireMessage(JSON.stringify({ type: 'announcement', announcement: null })),
    /Invalid announcement/
  )
})

test('duplicate filter accepts first announcement id and rejects repeats', () => {
  const seen = createDuplicateFilter()

  assert.equal(seen.accepts('abc'), true)
  assert.equal(seen.accepts('abc'), false)
  assert.equal(seen.accepts('def'), true)
})
