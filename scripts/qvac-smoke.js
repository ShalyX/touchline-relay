const { createQvacTranslator } = require('../lib/qvac-translator')

async function main() {
  const translator = createQvacTranslator()
  translator.onProgress((progress) => {
    process.stdout.write(`progress ${JSON.stringify(progress)}\n`)
  })

  try {
    const result = await translator.translateToSpanish('The final starts on Pitch 2 at 2:30 PM.')
    process.stdout.write(`translation ${result.text}\n`)
  } finally {
    await translator.dispose()
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
