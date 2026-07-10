const assert = require('node:assert/strict')
const test = require('node:test')

const { shouldRequestSingleInstanceLock } = require('../electron/instance-policy')

test('custom storage allows a second application instance', () => {
  assert.equal(shouldRequestSingleInstanceLock('/tmp/touchline-peer-b'), false)
})

test('default storage keeps the single instance lock', () => {
  assert.equal(shouldRequestSingleInstanceLock(undefined), true)
})
