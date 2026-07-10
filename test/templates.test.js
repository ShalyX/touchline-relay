const assert = require('node:assert/strict')
const test = require('node:test')

const { getTemplate, listTemplates, VENUES } = require('../lib/templates')

test('matchday templates cover core operational cues', () => {
  const templates = listTemplates()
  assert.ok(templates.length >= 4)
  assert.equal(getTemplate('kickoff-delay').priority, 'urgent')
  assert.ok(VENUES.includes('Pitch 2'))
  assert.ok(templates.every((item) => item.body && item.venue && item.priority))
})
