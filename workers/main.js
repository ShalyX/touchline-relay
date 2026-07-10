const FramedStream = require('framed-stream')
const { createRelayNode } = require('./relay-node')

const ipc = global.Bare && new FramedStream(Bare.IPC)

if (!ipc) {
  throw new Error('Touchline Relay worker must run inside PearRuntime/Bare')
}

const relay = createRelayNode({
  emit(event) {
    write(event)
  }
})

ipc.on('data', (data) => {
  const text = data.toString()

  if (text === 'pear:applyUpdate') {
    write({ type: 'pear:updateUnsupported' })
    return
  }

  let command
  try {
    command = JSON.parse(text)
  } catch (err) {
    write({ type: 'error', message: `Invalid worker command JSON: ${err.message}` })
    return
  }

  handleCommand(command).catch((err) => {
    write({ type: 'error', message: err.message })
  })
})

async function handleCommand(command) {
  if (command.type === 'join') {
    const status = await relay.join(command.room)
    write({ type: 'joined', ...status })
    return
  }

  if (command.type === 'publish') {
    const result = await relay.publish(command.announcement)
    write({ type: 'published', id: command.announcement.id, peers: result.peers })
    return
  }

  throw new Error(`Unsupported worker command: ${command.type}`)
}

function write(event) {
  ipc.write(JSON.stringify(event))
}
