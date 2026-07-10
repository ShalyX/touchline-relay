const assert = require('node:assert/strict')
const { duplexPair } = require('node:stream')
const test = require('node:test')
const Hyperswarm = require('hyperswarm')

const { makeAnnouncement } = require('../lib/protocol')
const { createRelayNode } = require('../workers/relay-node')

test('two Hyperswarm peers exchange a structured announcement', { timeout: 45000 }, async (t) => {
  const room = `touchline-test-${Date.now()}-${Math.random()}`
  const aliceSwarm = new Hyperswarm({ bootstrap: [] })
  const bobSwarm = new Hyperswarm({ bootstrap: [] })
  const aliceEvents = []
  const bobEvents = []
  const alice = createRelayNode({
    emit: (event) => aliceEvents.push(event),
    swarm: aliceSwarm
  })
  const bob = createRelayNode({
    emit: (event) => bobEvents.push(event),
    swarm: bobSwarm
  })

  t.after(async () => {
    await Promise.allSettled([alice.close(), bob.close()])
  })

  await Promise.all([alice.join(room), bob.join(room)])
  const [aliceSocket, bobSocket] = duplexPair()
  aliceSwarm.emit('connection', aliceSocket)
  bobSwarm.emit('connection', bobSocket)
  await waitFor(() => aliceEvents.some((event) => event.type === 'peer' && event.peers > 0), 30000)
  await waitFor(() => bobEvents.some((event) => event.type === 'peer' && event.peers > 0), 30000)

  const announcement = makeAnnouncement({
    room,
    venue: 'Pitch 1',
    priority: 'urgent',
    targetLanguage: 'es',
    body: 'The semifinal moves to Pitch 1.',
    translatedBody: 'La semifinal se traslada al Campo 1.'
  })

  await alice.publish(announcement)

  await waitFor(
    () =>
      bobEvents.some(
        (event) => event.type === 'announcement' && event.announcement.id === announcement.id
      ),
    30000
  )

  assert.equal(
    bobEvents.filter(
      (event) => event.type === 'announcement' && event.announcement.id === announcement.id
    ).length,
    1
  )
})

async function waitFor(predicate, timeout) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (predicate()) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  assert.fail(`Timed out after ${timeout}ms`)
}
