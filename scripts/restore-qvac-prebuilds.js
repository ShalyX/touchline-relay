const fs = require('node:fs')
const path = require('node:path')

function restoreQvacTranslationPrebuild({ projectRoot, outputPath, platform, arch }) {
  if (platform !== 'linux' || arch !== 'x64') {
    return { copied: false, reason: 'unsupported-target' }
  }

  const relative = path.join(
    'node_modules',
    '@qvac',
    'translation-nmtcpp',
    'prebuilds',
    `${platform}-${arch}`
  )
  const source = path.join(projectRoot, relative)
  const destination = path.join(outputPath, 'resources', 'app', relative)

  if (!fs.existsSync(source)) {
    throw new Error(`QVAC translation prebuild source is missing: ${source}`)
  }
  if (!fs.existsSync(path.dirname(destination))) {
    throw new Error(`Packaged QVAC module is missing: ${path.dirname(destination)}`)
  }

  fs.rmSync(destination, { recursive: true, force: true })
  fs.cpSync(source, destination, { recursive: true })

  return { copied: true, source, destination }
}

module.exports = { restoreQvacTranslationPrebuild }
