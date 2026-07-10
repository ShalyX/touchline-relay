const Hyperswarm = require('hyperswarm')
const b4a = require('b4a')

const {
  createDuplicateFilter,
  deriveRoomKey,
  parseWireMessage,
  serializeWireMessage,
  validateAnnouncement
} = require('../lib/protocol')

function createRelayNode({ emit = () => {}, swarm = new Hyperswarm() } = {}) {
  const peers = new Set()
  const duplicateFilter = createDuplicateFilter()
  let joined = null
  let closed = false

  swarm.on('connection', (socket) => {
    if (closed) {
      socket.destroy()
      return
    }

    peers.add(socket)
    emitStatus('peer')

    let pending = ''
    socket.on('data', (chunk) => {
      pending += chunk.toString('utf8')
      let newline = pending.indexOf('\n')
      while (newline !== -1) {
        const line = pending.slice(0, newline)
        pending = pending.slice(newline + 1)
        handleLine(line, socket)
        newline = pending.indexOf('\n')
      }
    })
    socket.on('close', () => {
      peers.delete(socket)
      emitStatus('peer')
    })
    socket.on('error', (err) => {
      emit({ type: 'error', message: err.message })
    })
  })

  async function join(room) {
    if (closed) throw new Error('Relay node is closed')
    joined = String(room || '').trim()
    if (!joined) throw new Error('Room is required')
    const topic = deriveRoomKey(joined)
    const discovery = swarm.join(topic, { server: true, client: true })
    await discovery.flushed()
    const identity = {
      topic: b4a.toString(topic, 'hex'),
      peerId: b4a.toString(swarm.keyPair.publicKey, 'hex')
    }
    emit({ type: 'status', status: 'joined', room: joined, peers: peers.size, ...identity })
    return { room: joined, peers: peers.size, ...identity }
  }

  async function publish(announcement) {
    if (!joined) throw new Error('Join a room before publishing')
    const result = validateAnnouncement(announcement)
    if (!result.ok) throw new Error(`Invalid announcement: ${result.errors.join(', ')}`)
    duplicateFilter.accepts(announcement.id)
    const wire = serializeWireMessage({ type: 'announcement', announcement })
    for (const peer of peers) {
      if (!peer.destroyed) peer.write(wire)
    }
    return { peers: peers.size }
  }

  async function close() {
    closed = true
    for (const peer of peers) peer.destroy()
    peers.clear()
    await swarm.destroy()
  }

  function handleLine(line, socket) {
    if (!line.trim()) return
    try {
      const message = parseWireMessage(line)
      if (!duplicateFilter.accepts(message.announcement.id)) return
      emit({ type: 'announcement', announcement: message.announcement })
      for (const peer of peers) {
        if (peer !== socket && !peer.destroyed) peer.write(serializeWireMessage(message))
      }
    } catch (err) {
      emit({ type: 'error', message: err.message })
    }
  }

  function emitStatus(type) {
    emit({ type, status: joined ? 'joined' : 'idle', room: joined, peers: peers.size })
  }

  return { join, publish, flush: () => swarm.flush(), close }
}

module.exports = { createRelayNode }
