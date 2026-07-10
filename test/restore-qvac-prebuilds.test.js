const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { restoreQvacTranslationPrebuild } = require('../scripts/restore-qvac-prebuilds')

test('restoreQvacTranslationPrebuild replaces the packaged native directory byte-for-byte', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'touchline-qvac-restore-'))
  const sourceRoot = path.join(root, 'source')
  const packagedRoot = path.join(root, 'packaged')
  const relative = path.join(
    'node_modules',
    '@qvac',
    'translation-nmtcpp',
    'prebuilds',
    'linux-x64'
  )
  const sourceDir = path.join(sourceRoot, relative)
  const packagedDir = path.join(packagedRoot, 'resources', 'app', relative)
  fs.mkdirSync(sourceDir, { recursive: true })
  fs.mkdirSync(packagedDir, { recursive: true })
  fs.writeFileSync(path.join(sourceDir, 'native.so'), Buffer.from('complete-qvac-native'))
  fs.writeFileSync(path.join(packagedDir, 'native.so'), Buffer.from('truncated'))
  fs.writeFileSync(path.join(packagedDir, 'stale.so'), Buffer.from('stale'))

  const result = restoreQvacTranslationPrebuild({
    projectRoot: sourceRoot,
    outputPath: packagedRoot,
    platform: 'linux',
    arch: 'x64'
  })

  assert.equal(result.copied, true)
  assert.equal(fs.readFileSync(path.join(packagedDir, 'native.so'), 'utf8'), 'complete-qvac-native')
  assert.equal(fs.existsSync(path.join(packagedDir, 'stale.so')), false)
})

test('restoreQvacTranslationPrebuild is a no-op on unsupported targets', () => {
  assert.deepEqual(
    restoreQvacTranslationPrebuild({
      projectRoot: '/does/not/matter',
      outputPath: '/does/not/matter',
      platform: 'win32',
      arch: 'x64'
    }),
    { copied: false, reason: 'unsupported-target' }
  )
})
