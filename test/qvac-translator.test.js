const assert = require('node:assert/strict')
const test = require('node:test')

const { createQvacTranslator } = require('../lib/qvac-translator')

test('QVAC translator loads Bergamot EN->ES, translates, unloads, and closes', async () => {
  const calls = []
  const sdk = {
    BERGAMOT_EN_ES: { name: 'bergamot-en-es' },
    BERGAMOT_EN_FR: { name: 'bergamot-en-fr' },
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
  assert.equal(result.targetLanguage, 'es')
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
  assert.deepEqual(progress, [{ loaded: 1, total: 1, targetLanguage: 'es' }])
})

test('QVAC translator can load French Bergamot target', async () => {
  const sdk = {
    BERGAMOT_EN_ES: { name: 'bergamot-en-es' },
    BERGAMOT_EN_FR: { name: 'bergamot-en-fr' },
    async loadModel(options) {
      return options.modelConfig.to === 'fr' ? 'model-fr' : 'model-es'
    },
    translate() {
      return { text: Promise.resolve('Le match commence maintenant.') }
    },
    async unloadModel() {},
    async close() {}
  }
  const translator = createQvacTranslator({ sdk })
  const result = await translator.translate('The match starts now.', 'fr')
  assert.equal(result.targetLanguage, 'fr')
  assert.equal(result.text, 'Le match commence maintenant.')
  await translator.dispose()
})
