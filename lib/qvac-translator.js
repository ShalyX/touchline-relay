function createQvacTranslator({ sdk = require('@qvac/sdk') } = {}) {
  let modelId = null
  let loading = null
  let disposed = false
  const progressListeners = new Set()

  async function ensureModel() {
    if (disposed) throw new Error('QVAC translator is closed')
    if (modelId) return modelId
    if (!loading) {
      loading = sdk
        .loadModel({
          modelSrc: sdk.BERGAMOT_EN_ES,
          modelConfig: { engine: 'Bergamot', from: 'en', to: 'es' },
          onProgress: (progress) => {
            for (const listener of progressListeners) listener(progress)
          }
        })
        .then((id) => {
          modelId = id
          return id
        })
        .finally(() => {
          loading = null
        })
    }
    return loading
  }

  return {
    onProgress(listener) {
      progressListeners.add(listener)
      return () => progressListeners.delete(listener)
    },
    async translateToSpanish(text) {
      const trimmed = String(text || '').trim()
      if (!trimmed) throw new Error('Text is required')
      const id = await ensureModel()
      const result = sdk.translate({
        modelId: id,
        text: trimmed,
        modelType: 'nmtcpp-translation',
        stream: false
      })
      const translated = await result.text
      return {
        text: Array.isArray(translated) ? translated.join('\n') : String(translated || '')
      }
    },
    async dispose() {
      disposed = true
      if (loading) await loading
      if (modelId) {
        await sdk.unloadModel({ modelId })
        modelId = null
      }
      await sdk.close()
    }
  }
}

module.exports = { createQvacTranslator }
