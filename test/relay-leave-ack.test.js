const assert = require('node:assert/strict')
const { duplexPair } = require('node:stream')
const test = require('node:test')
const Hyperswarm = require('hyperswarm')

const { makeAnnouncement } = require('../lib/protocol')
const { createRelayNode } = require('../workers/relay-node')

async function waitFor(predicate, timeout = 10000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (predicate()) return
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
  assert.fail(`Timed out after ${timeout}ms`)
}

test('leave clears membership and ack is returned after announcement', async (t) => {
  const room = `leave-ack-${Date.now()}`
  const aliceEvents = []
  const bobEvents = []
  const aliceSwarm = new Hyperswarm({ bootstrap: [] })
  const bobSwarm = new Hyperswarm({ bootstrap: [] })
  const alice = createRelayNode({ emit: (e) => aliceEvents.push(e), swarm: aliceSwarm })
  const bob = createRelayNode({ emit: (e) => bobEvents.push(e), swarm: bobSwarm })
  t.after(async () => {
    await Promise.allSettled([alice.close(), bob.close()])
  })

  await Promise.all([alice.join(room), bob.join(room)])
  const [aSocket, bSocket] = duplexPair()
  aliceSwarm.emit('connection', aSocket)
  bobSwarm.emit('connection', bSocket)
  await waitFor(() => aliceEvents.some((e) => e.type === 'peer' && e.peers > 0))
  await waitFor(() => bobEvents.some((e) => e.type === 'peer' && e.peers > 0))

  const announcement = makeAnnouncement({
    room,
    venue: 'Pitch 1',
    priority: 'urgent',
    targetLanguage: 'es',
    body: 'Briefing moved to Pitch 1.',
    translatedBody: 'La reunión se traslada al Campo 1.'
  })
  await alice.publish(announcement)
  await waitFor(() =>
    bobEvents.some((e) => e.type === 'announcement' && e.announcement.id === announcement.id)
  )
  await waitFor(() =>
    aliceEvents.some((e) => e.type === 'ack' && e.announcementId === announcement.id)
  )

  await alice.leave()
  assert.equal(
    aliceEvents.some((e) => e.type === 'left'),
    true
  )
  await alice.join(room)
  assert.equal(
    aliceEvents.some((e) => e.type === 'status' && e.status === 'joined'),
    true
  )
})
