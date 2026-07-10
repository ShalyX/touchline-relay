# Building installers / release artifacts

## Linux (this repo’s verified host)

```bash
npm run package
# Folder app:
# out/Touchline Relay-linux-x64/

# Optional AppImage / DEB / RPM / ZIP via Forge makers (host tools required):
npm run make
```

Zip a portable folder for judges:

```bash
cd out
zip -r touchline-relay-linux-x64.zip "Touchline Relay-linux-x64"
```

## Windows (on a Windows builder)

Requirements: Node 20+, Windows SDK for MSIX if using maker-msix.

```powershell
npm install
npm run package
npm run make
```

Outputs land under `out/make/` (DMG/MSIX/ZIP depending on platform makers in `forge.config.js`).

## macOS (on a Mac builder)

```bash
npm install
npm run package
npm run make
# DMG via @electron-forge/maker-dmg when codesign env is set
```

Codesign/notarize optional via:

- `MAC_CODESIGN_IDENTITY`
- `KEYCHAIN_PROFILE`

## Honest packaging note

QVAC native prebuilds are restored post-package on Linux x64 by `scripts/restore-qvac-prebuilds.js`. Always verify:

```bash
npm run qvac:smoke
# and a packaged binary translate smoke if shipping a release
```
