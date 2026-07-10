const assert = require('node:assert/strict')
const test = require('node:test')

const { createQvacTranslator } = require('../lib/qvac-translator')

test('QVAC translator loads Bergamot EN->ES, translates, unloads, and closes', async () => {
  const calls = []
  const sdk = {
    BERGAMOT_EN_ES: { name: 'bergamot-en-es' },
    async loadModel(options) {
      calls.push(['loadModel', options])
      options.onProgress({ loaded: 1, total: 1 })
      return 'model-1'
    },
    translate(options) {
      calls.push(['translate', options])
      return { text: Promise.resolve('El partido empieza ahora.') }
    },
    async unloadModel(options) {
      calls.push(['unloadModel', options])
    },
    async close() {
      calls.push(['close'])
    }
  }

  const translator = createQvacTranslator({ sdk })
  const progress = []
  translator.onProgress((event) => progress.push(event))

  const result = await translator.translateToSpanish('The match starts now.')
  await translator.dispose()

  assert.equal(result.text, 'El partido empieza ahora.')
  assert.deepEqual(calls[0][1], {
    modelSrc: sdk.BERGAMOT_EN_ES,
    modelConfig: { engine: 'Bergamot', from: 'en', to: 'es' },
    onProgress: calls[0][1].onProgress
  })
  assert.deepEqual(calls[1], [
    'translate',
    {
      modelId: 'model-1',
      text: 'The match starts now.',
      modelType: 'nmtcpp-translation',
      stream: false
    }
  ])
  assert.deepEqual(calls.slice(2), [['unloadModel', { modelId: 'model-1' }], ['close']])
  assert.deepEqual(progress, [{ loaded: 1, total: 1 }])
})
