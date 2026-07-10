const TARGETS = {
  es: { constant: 'BERGAMOT_EN_ES', label: 'Spanish · ES' },
  fr: { constant: 'BERGAMOT_EN_FR', label: 'French · FR' },
  de: { constant: 'BERGAMOT_EN_DE', label: 'German · DE' },
  pt: { constant: 'BERGAMOT_EN_PT', label: 'Portuguese · PT' }
}

function createQvacTranslator({ sdk = require('@qvac/sdk') } = {}) {
  const models = new Map()
  const loading = new Map()
  let disposed = false
  const progressListeners = new Set()

  async function ensureModel(targetLanguage = 'es') {
    if (disposed) throw new Error('QVAC translator is closed')
    const lang = String(targetLanguage || 'es')
    const target = TARGETS[lang]
    if (!target) throw new Error(`Unsupported target language: ${lang}`)
    if (!sdk[target.constant]) {
      throw new Error(`QVAC SDK is missing ${target.constant}`)
    }
    if (models.has(lang)) return models.get(lang)
    if (!loading.has(lang)) {
      const pending = sdk
        .loadModel({
          modelSrc: sdk[target.constant],
          modelConfig: { engine: 'Bergamot', from: 'en', to: lang },
          onProgress: (progress) => {
            for (const listener of progressListeners) {
              listener({ ...progress, targetLanguage: lang })
            }
          }
        })
        .then((id) => {
          models.set(lang, id)
          return id
        })
        .finally(() => {
          loading.delete(lang)
        })
      loading.set(lang, pending)
    }
    return loading.get(lang)
  }

  return {
    supportedTargets: Object.fromEntries(
      Object.entries(TARGETS).map(([code, value]) => [code, value.label])
    ),
    onProgress(listener) {
      progressListeners.add(listener)
      return () => progressListeners.delete(listener)
    },
    async translate(text, targetLanguage = 'es') {
      const trimmed = String(text || '').trim()
      if (!trimmed) throw new Error('Text is required')
      const lang = String(targetLanguage || 'es')
      const id = await ensureModel(lang)
      const result = sdk.translate({
        modelId: id,
        text: trimmed,
        modelType: 'nmtcpp-translation',
        stream: false
      })
      const translated = await result.text
      return {
        text: Array.isArray(translated) ? translated.join('\n') : String(translated || ''),
        targetLanguage: lang
      }
    },
    async translateToSpanish(text) {
      return this.translate(text, 'es')
    },
    async dispose() {
      disposed = true
      for (const pending of loading.values()) await pending
      for (const modelId of models.values()) {
        await sdk.unloadModel({ modelId })
      }
      models.clear()
      await sdk.close()
    }
  }
}

module.exports = { createQvacTranslator, TARGETS }
