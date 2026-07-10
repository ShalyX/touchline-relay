const b4a = require('b4a')
const crypto = require('hypercore-crypto')

const ANNOUNCEMENT_TYPE = 'touchline.announcement.v1'
const MAX_BODY_LENGTH = 420
const PRIORITIES = new Set(['routine', 'important', 'urgent'])
const SUPPORTED_TARGET_LANGUAGES = new Set(['es', 'fr', 'de', 'pt'])

function deriveRoomKey(room) {
  const label = normalizeText(room).toLowerCase()
  return crypto.hash(b4a.from(`touchline-relay-room:v1:${label}`))
}

function makeAnnouncement({ room, venue, priority, targetLanguage, body, translatedBody }) {
  const createdAt = new Date().toISOString()
  const lang = String(targetLanguage || 'es')
  const translations = {}
  if (
    SUPPORTED_TARGET_LANGUAGES.has(lang) &&
    typeof translatedBody === 'string' &&
    translatedBody.trim()
  ) {
    translations[lang] = translatedBody.trim()
  }

  const base = {
    type: ANNOUNCEMENT_TYPE,
    room: normalizeText(room),
    venue: normalizeText(venue),
    priority,
    body: normalizeText(body),
    translations,
    createdAt
  }

  return {
    id: announcementId(base),
    ...base
  }
}

function validateAnnouncement(value) {
  const errors = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, errors: ['announcement must be an object'] }
  }

  if (value.type !== ANNOUNCEMENT_TYPE) errors.push(`type must be ${ANNOUNCEMENT_TYPE}`)
  if (!/^[a-f0-9]{64}$/.test(value.id || '')) errors.push('id must be a 64-character hex string')
  if (!isNonEmptyString(value.room, 80)) errors.push('room must be 1-80 characters')
  if (!isNonEmptyString(value.venue, 80)) errors.push('venue must be 1-80 characters')
  if (!PRIORITIES.has(value.priority)) errors.push('priority must be routine, important, or urgent')
  if (!isNonEmptyString(value.body, MAX_BODY_LENGTH)) {
    errors.push(`body must be 1-${MAX_BODY_LENGTH} characters`)
  }
  if (
    !value.translations ||
    typeof value.translations !== 'object' ||
    Array.isArray(value.translations)
  ) {
    errors.push('translations must be an object')
  } else {
    const langs = Object.keys(value.translations).filter((key) =>
      SUPPORTED_TARGET_LANGUAGES.has(key)
    )
    if (langs.length === 0) {
      errors.push('translations must include a supported target language (es, fr, de, pt)')
    } else {
      for (const lang of langs) {
        if (!isNonEmptyString(value.translations[lang], MAX_BODY_LENGTH * 2)) {
          errors.push(`translations.${lang} must be present`)
        }
      }
    }
  }
  if (!Number.isFinite(Date.parse(value.createdAt))) errors.push('createdAt must be an ISO date')

  return { ok: errors.length === 0, errors }
}

function validateAck(value) {
  const errors = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, errors: ['ack must be an object'] }
  }
  if (value.type !== 'ack') errors.push('type must be ack')
  if (!/^[a-f0-9]{64}$/.test(value.announcementId || '')) {
    errors.push('announcementId must be a 64-character hex string')
  }
  if (!isNonEmptyString(value.peerId, 128)) errors.push('peerId must be 1-128 characters')
  return { ok: errors.length === 0, errors }
}

function serializeWireMessage(message) {
  if (!message || typeof message !== 'object') throw new Error('Unsupported wire message')
  if (message.type === 'announcement') {
    const result = validateAnnouncement(message.announcement)
    if (!result.ok) throw new Error(`Invalid announcement: ${result.errors.join(', ')}`)
    return JSON.stringify(message) + '\n'
  }
  if (message.type === 'ack') {
    const result = validateAck(message)
    if (!result.ok) throw new Error(`Invalid ack: ${result.errors.join(', ')}`)
    return JSON.stringify(message) + '\n'
  }
  throw new Error('Unsupported wire message')
}

function parseWireMessage(data) {
  let message
  try {
    message = JSON.parse(String(data).trim())
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`)
  }

  if (!message || typeof message !== 'object') throw new Error('Unsupported wire message')
  if (message.type === 'announcement') {
    const result = validateAnnouncement(message.announcement)
    if (!result.ok) throw new Error(`Invalid announcement: ${result.errors.join(', ')}`)
    return message
  }
  if (message.type === 'ack') {
    const result = validateAck(message)
    if (!result.ok) throw new Error(`Invalid ack: ${result.errors.join(', ')}`)
    return message
  }
  throw new Error('Unsupported wire message')
}

function createDuplicateFilter(limit = 512) {
  const ids = new Set()
  const order = []

  return {
    accepts(id) {
      if (ids.has(id)) return false
      ids.add(id)
      order.push(id)
      while (order.length > limit) ids.delete(order.shift())
      return true
    }
  }
}

function announcementId(announcement) {
  const stable = {
    type: announcement.type,
    room: announcement.room,
    venue: announcement.venue,
    priority: announcement.priority,
    body: announcement.body,
    translations: announcement.translations,
    createdAt: announcement.createdAt
  }
  return b4a.toString(crypto.hash(b4a.from(JSON.stringify(stable))), 'hex')
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
}

function isNonEmptyString(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}

module.exports = {
  ANNOUNCEMENT_TYPE,
  SUPPORTED_TARGET_LANGUAGES,
  createDuplicateFilter,
  deriveRoomKey,
  makeAnnouncement,
  parseWireMessage,
  serializeWireMessage,
  validateAck,
  validateAnnouncement
}
